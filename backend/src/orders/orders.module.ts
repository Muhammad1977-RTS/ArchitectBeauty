import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [NotificationsModule, ProfilesModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
