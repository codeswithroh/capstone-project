import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TonModule } from './ton/ton.module';
import { ChannelModule } from './channel/channel.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TonModule, ChannelModule, TelegramModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
