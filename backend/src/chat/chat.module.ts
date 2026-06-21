import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { MessagesModule } from '../messages/messages.module';
import { TransportMessagesModule } from '../transport-messages/transport-messages.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [AuthModule, MessagesModule, TransportMessagesModule, NotificationsModule, ProfilesModule],
  providers: [ChatGateway],
})
export class ChatModule {}
