import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class ResponsesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private profiles: ProfilesService,
  ) {}

  async create(masterId: string, data: {
    orderId: string;
    proposedPrice: number;
    comment?: string;
    estimatedDays?: number;
  }) {
    const exists = await this.prisma.response.findUnique({
      where: { orderId_masterId: { orderId: data.orderId, masterId } },
    });
    if (exists) throw new ConflictException('Already responded');

    const response = await this.prisma.response.create({
      data: { ...data, masterId },
      include: { master: { select: { id: true, name: true } } },
    });

    const order = await this.prisma.order.findUnique({ where: { id: data.orderId }, select: { clientId: true } });
    if (order) {
      const token = await this.profiles.getFcmToken(order.clientId);
      if (token) {
        await this.notifications.sendToToken(token, 'Новый отклик', `Мастер ${response.master.name} откликнулся на ваш заказ`);
      }
    }

    return response;
  }

  findByMaster(masterId: string) {
    return this.prisma.response.findMany({
      where: { masterId },
      include: {
        order: { include: { workType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByOrder(orderId: string) {
    return this.prisma.response.findMany({
      where: { orderId },
      include: { master: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markSeen(orderId: string, userId: string) {
    await this.prisma.response.updateMany({
      where: { orderId, seen: false },
      data: { seen: true },
    });
  }

  async countUnread(masterId: string) {
    const responses = await this.prisma.response.findMany({
      where: { masterId, status: 'selected', seen: false },
      select: { orderId: true },
    });
    const counts: Record<string, number> = {};
    for (const r of responses) {
      counts[r.orderId] = (counts[r.orderId] || 0) + 1;
    }
    return counts;
  }

  async countUnseenForClient(clientId: string) {
    const responses = await this.prisma.response.findMany({
      where: { order: { clientId }, seen: false },
      select: { orderId: true },
    });
    const counts: Record<string, number> = {};
    for (const r of responses) {
      counts[r.orderId] = (counts[r.orderId] || 0) + 1;
    }
    return counts;
  }
}
