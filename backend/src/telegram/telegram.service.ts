import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { ChannelService } from '../channel/channel.service';
import { TonService } from '../ton/ton.service';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot?: Telegraf;

  constructor(
    private readonly cfg: ConfigService,
    private readonly channels: ChannelService,
    private readonly ton: TonService,
  ) {}

  async onModuleInit() {
    const token = this.cfg.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set, Telegram bot is disabled');
      return;
    }
    this.bot = new Telegraf(token);

    // /open_channel <channelAddr> <addrA> <addrB>
    this.bot.command('open_channel', async (ctx) => {
      try {
        const parts = (ctx.message as any).text.split(/\s+/);
        if (parts.length < 4) {
          return ctx.reply('Usage: /open_channel <channelAddress> <addrA> <addrB>');
        }
        const [, channelAddress, addrA, addrB] = parts;
        const state = this.channels.openChannel({ address: channelAddress, addrA, addrB });
        await ctx.reply(`Channel opened (off-chain)\nAddress: ${state.address}\nA: ${state.addrA}\nB: ${state.addrB}\nNonce: ${state.nonce}`);
        await ctx.reply('Deploy on-chain using your Blueprint script: \n`cd PaymentChannel && npx blueprint run` -> deployPaymentChannel');
      } catch (e: any) {
        this.logger.error(e);
        await ctx.reply('Failed to open channel');
      }
    });

    // /channel_state <channelAddr>
    this.bot.command('channel_state', async (ctx) => {
      const parts = (ctx.message as any).text.split(/\s+/);
      if (parts.length < 2) return ctx.reply('Usage: /channel_state <channelAddress>');
      const [, channelAddress] = parts;
      const st = this.channels.getState(channelAddress);
      if (!st) return ctx.reply('Channel not found');
      await ctx.reply(`State\nAddress: ${st.address}\nNonce: ${st.nonce}\nClosed: ${st.closed}\nA: ${st.addrA} => ${st.balanceA}\nB: ${st.addrB} => ${st.balanceB}`);
    });

    // /close_channel <channelAddr> <finalNonce> <amountA> <amountB>
    this.bot.command('close_channel', async (ctx) => {
      try {
        const parts = (ctx.message as any).text.split(/\s+/);
        if (parts.length < 5) {
          return ctx.reply('Usage: /close_channel <channelAddress> <finalNonce> <amountA_nano> <amountB_nano>');
        }
        const [, channelAddress, finalNonceStr, amountAStr, amountBStr] = parts;
        const st = this.channels.finalize(channelAddress, {
          finalNonce: Number(finalNonceStr),
          amountA: amountAStr,
          amountB: amountBStr,
        });
        if (!st) return ctx.reply('Channel not found');
        await ctx.reply(`Finalizing off-chain state:\nNonce: ${st.nonce}\nA: ${st.balanceA}\nB: ${st.balanceB}\nClosed: ${st.closed}`);
        await ctx.reply('Send on-chain close using your Blueprint script: \n`cd PaymentChannel && npx blueprint run` -> closePaymentChannel');
      } catch (e: any) {
        this.logger.error(e);
        await ctx.reply('Failed to close channel');
      }
    });

    // /gas_report <addressOrTx>
    this.bot.command('gas_report', async (ctx) => {
      const parts = (ctx.message as any).text.split(/\s+/);
      if (parts.length < 2) return ctx.reply('Usage: /gas_report <channelAddress | txHash>');
      const [, id] = parts;
      try {
        if (id.length > 44) {
          const tx = await this.ton.getTx(id);
          return ctx.reply(`Tx ${id}\nfee: ${tx.total_fees ?? tx.fee}\nnow: ${tx.now}`);
        }
        const rep = await this.ton.gasReportByAddress(id);
        await ctx.reply(`Recent tx fees for ${id}:\n${(rep || []).slice(0, 5).map((r: any) => `• ${r.hash} fee=${r.fee}`).join('\n') || 'No data'}`);
      } catch (e: any) {
        this.logger.error(e);
        await ctx.reply('Failed to fetch gas report');
      }
    });

    await this.bot.launch();
    this.logger.log('Telegram bot launched');
  }

  async onModuleDestroy() {
    if (this.bot) {
      await this.bot.stop();
      this.logger.log('Telegram bot stopped');
    }
  }
}
