/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { NotificationService } from '../notifications/notifications.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}