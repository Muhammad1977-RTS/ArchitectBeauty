import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ORDER_INCLUDE = {
  workType: true,
  client: { select: { id: true, name: true, phone: true } },
  selectedMaster: { select: { id: true, name: true, phone: true } },
  responses: {
    include: { master: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({
      where: { status: 'new' },
      include: { workType: true, client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByClient(clientId: string) {
    return this.prisma.order.findMany({
      where: { clientId },
      include: { workType: true, responses: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  create(clientId: string, data: {
    workTypeId: string;
    areaSqm: number;
    address: string;
    description?: string;
    photoUrls?: string[];
  }) {
    return this.prisma.order.create({
      data: { ...data, clientId },
      include: { workType: true },
    });
  }

  async selectMaster(orderId: string, masterId: string, clientId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (order.clientId !== clientId) throw new ForbiddenException();
    if (order.status !== 'new') throw new BadRequestException('Order is not open');

    await this.prisma.response.updateMany({
      where: { orderId },
      data: { status: 'rejected' },
    });
    await this.prisma.response.updateMany({
      where: { orderId, masterId },
      data: { status: 'selected' },
    });

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'master_selected', selectedMasterId: masterId },
      include: ORDER_INCLUDE,
    });
  }

  async complete(orderId: string, clientId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (order.clientId !== clientId) throw new ForbiddenException();
    if (order.status !== 'master_selected') throw new BadRequestException('Order is not in progress');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed' },
      include: ORDER_INCLUDE,
    });
  }

  async rate(orderId: string, clientId: string, rating: number, reviewText?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (order.clientId !== clientId) throw new ForbiddenException();
    if (order.status !== 'completed') throw new BadRequestException('Order is not completed');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { rating, reviewText },
      include: ORDER_INCLUDE,
    });
  }

  async delete(orderId: string, clientId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException();
    if (order.clientId !== clientId) throw new ForbiddenException();
    return this.prisma.order.delete({ where: { id: orderId } });
  }
}
