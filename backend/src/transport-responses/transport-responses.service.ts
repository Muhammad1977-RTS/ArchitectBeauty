import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class TransportResponsesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private profiles: ProfilesService,
  ) {}

  async create(carrierId: string, data: {
    orderId: string;
    proposedPrice: number;
    comment?: string;
    vehicleType?: string;
  }) {
    const exists = await this.prisma.transportResponse.findUnique({
      where: { orderId_carrierId: { orderId: data.orderId, carrierId } },
    });
    if (exists) throw new ConflictException('Already responded');

    const response = await this.prisma.transportResponse.create({
      data: { ...data, carrierId },
    });

    const order = await this.prisma.transportOrder.findUnique({ where: { id: data.orderId }, select: { clientId: true } });
    if (order) {
      const token = await this.profiles.getFcmToken(order.clientId);
      if (token) await this.notifications.sendToToken(token, 'Новый отклик', 'Перевозчик откликнулся на ваш заказ');
    }

    return response;
  }

  findByCarrier(carrierId: string) {
    return this.prisma.transportResponse.findMany({
      where: { carrierId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByOrder(orderId: string) {
    return this.prisma.transportResponse.findMany({
      where: { orderId },
      include: { carrier: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async countUnseenForClient(clientId: string) {
    const responses = await this.prisma.transportResponse.findMany({
      where: { order: { clientId }, seen: false },
      select: { orderId: true },
    });
    const counts: Record<string, number> = {};
    for (const r of responses) {
      counts[r.orderId] = (counts[r.orderId] || 0) + 1;
    }
    return counts;
  }

  async markSeen(orderId: string, _userId: string) {
    await this.prisma.transportResponse.updateMany({
      where: { orderId, seen: false },
      data: { seen: true },
    });
  }
}
