import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  findByOrder(orderId: string) {
    return this.prisma.message.findMany({
      where: { orderId },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  send(orderId: string, senderId: string, content: string) {
    return this.prisma.message.create({
      data: { orderId, senderId, content },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
  }

  async markRead(orderId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: { orderId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async countUnread(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { readAt: null, senderId: { not: userId } },
      select: { orderId: true },
    });
    const counts: Record<string, number> = {};
    for (const m of messages) {
      counts[m.orderId] = (counts[m.orderId] || 0) + 1;
    }
    return counts;
  }
}
