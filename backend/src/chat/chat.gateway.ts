import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../messages/messages.service';
import { TransportMessagesService } from '../transport-messages/transport-messages.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProfilesService } from '../profiles/profiles.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: false },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private jwt: JwtService,
    private messages: MessagesService,
    private transportMessages: TransportMessagesService,
    private notifications: NotificationsService,
    private profiles: ProfilesService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.headers?.authorization as string)?.replace('Bearer ', '');

    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwt.verify<{ sub: string; role: string }>(token);
      client.data.userId = payload.sub;
      client.data.role = payload.role;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string; otherId: string; isTransport?: boolean },
  ) {
    const room = data.isTransport
      ? `transport:${data.orderId}:${data.otherId}`
      : `chat:${data.orderId}:${data.otherId}`;
    client.join(room);
    return { status: 'joined', room };
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { orderId: string; otherId: string; content: string; isTransport?: boolean },
  ) {
    const senderId = client.data.userId as string;
    if (!senderId || !data.content?.trim()) return;

    if (data.isTransport) {
      const msg = await this.transportMessages.send(
        data.orderId,
        data.otherId,
        senderId,
        data.content.trim(),
      );
      const room = `transport:${data.orderId}:${data.otherId}`;
      this.server.to(room).emit('new_message', msg);
      const recipientId = senderId === data.otherId ? senderId : data.otherId;
      const token = await this.profiles.getFcmToken(recipientId);
      if (token) await this.notifications.sendToToken(token, 'Новое сообщение', data.content.trim());
      return msg;
    } else {
      const msg = await this.messages.send(
        data.orderId,
        data.otherId,
        senderId,
        data.content.trim(),
      );
      const room = `chat:${data.orderId}:${data.otherId}`;
      this.server.to(room).emit('new_message', msg);
      const recipientId = senderId === data.otherId ? senderId : data.otherId;
      const token = await this.profiles.getFcmToken(recipientId);
      if (token) await this.notifications.sendToToken(token, 'Новое сообщение', data.content.trim());
      return msg;
    }
  }
}
