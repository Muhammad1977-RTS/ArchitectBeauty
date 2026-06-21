import { Module } from '@nestjs/common';
import { TransportResponsesController } from './transport-responses.controller';
import { TransportResponsesService } from './transport-responses.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [NotificationsModule, ProfilesModule],
  controllers: [TransportResponsesController],
  providers: [TransportResponsesService],
})
export class TransportResponsesModule {}
