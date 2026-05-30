import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransportMessagesService {
  constructor(private prisma: PrismaService) {}

  findByOrder(orderId: string, carrierId: string) {
    return this.prisma.transportMessage.findMany({
      where: { orderId, carrierId },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  send(orderId: string, carrierId: string, senderId: string, content: string) {
    return this.prisma.transportMessage.create({
      data: { orderId, carrierId, senderId, content },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
  }

  async markRead(orderId: string, carrierId: string, userId: string) {
    await this.prisma.transportMessage.updateMany({
      where: { orderId, carrierId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async countUnread(userId: string) {
    const messages = await this.prisma.transportMessage.findMany({
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
