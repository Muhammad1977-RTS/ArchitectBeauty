import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransportOrdersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.transportOrder.findMany({
      where: { status: 'new' },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByClient(clientId: string) {
    return this.prisma.transportOrder.findMany({
      where: { clientId },
      include: { responses: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.transportOrder.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        selectedCarrier: { select: { id: true, name: true, phone: true } },
        responses: {
          include: { carrier: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!order) throw new NotFoundException('Transport order not found');
    return order;
  }

  create(clientId: string, data: {
    fromAddress: string;
    toAddress: string;
    cargoDescription: string;
    cargoWeightKg?: number;
    cargoVolumeM3?: number;
    transportDate?: string;
    budget?: number;
  }) {
    return this.prisma.transportOrder.create({
      data: {
        ...data,
        clientId,
        transportDate: data.transportDate ? new Date(data.transportDate) : undefined,
      },
    });
  }

  async selectCarrier(orderId: string, carrierId: string, clientId: string) {
    const order = await this.prisma.transportOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (order.clientId !== clientId) throw new ForbiddenException();
    if (order.status !== 'new') throw new BadRequestException('Order is not open');

    await this.prisma.transportResponse.updateMany({
      where: { orderId },
      data: { status: 'rejected' },
    });
    await this.prisma.transportResponse.updateMany({
      where: { orderId, carrierId },
      data: { status: 'selected' },
    });

    return this.prisma.transportOrder.update({
      where: { id: orderId },
      data: { status: 'carrier_selected', selectedCarrierId: carrierId },
    });
  }

  async complete(orderId: string, clientId: string) {
    const order = await this.prisma.transportOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (order.clientId !== clientId) throw new ForbiddenException();
    if (order.status !== 'carrier_selected') throw new BadRequestException('Order is not in carrier_selected state');

    return this.prisma.transportOrder.update({
      where: { id: orderId },
      data: { status: 'completed' },
    });
  }

  async rate(orderId: string, clientId: string, rating: number, reviewText?: string) {
    const order = await this.prisma.transportOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (order.clientId !== clientId) throw new ForbiddenException();
    if (order.status !== 'completed') throw new BadRequestException('Order must be completed before rating');

    return this.prisma.transportOrder.update({
      where: { id: orderId },
      data: { rating, reviewText },
    });
  }
}
