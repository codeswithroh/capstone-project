import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ChannelModule } from '../channel/channel.module';
import { TonModule } from '../ton/ton.module';

@Module({
  imports: [ChannelModule, TonModule],
  providers: [TelegramService]
})
export class TelegramModule {}
