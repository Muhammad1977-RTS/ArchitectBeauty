import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findByStore(storeId: string) {
    return this.prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  create(storeId: string, data: {
    name: string;
    description?: string;
    price: number;
    unit: string;
    category?: string;
    inStock?: boolean;
  }) {
    return this.prisma.product.create({ data: { ...data, storeId } });
  }

  async update(id: string, storeId: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    unit: string;
    category: string;
    inStock: boolean;
  }>) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException();
    if (product.storeId !== storeId) throw new ForbiddenException();
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string, storeId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException();
    if (product.storeId !== storeId) throw new ForbiddenException();
    return this.prisma.product.delete({ where: { id } });
  }
}
