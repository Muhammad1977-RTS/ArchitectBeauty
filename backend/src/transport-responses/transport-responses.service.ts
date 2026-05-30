import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransportResponsesService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.transportResponse.create({
      data: { ...data, carrierId },
    });
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
