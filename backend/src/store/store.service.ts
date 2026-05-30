import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.storeProfile.findMany({
      include: {
        store: { select: { phone: true, cityDistrict: true } },
        _count: { select: { products: true } },
      },
    });
  }

  findById(storeId: string) {
    return this.prisma.storeProfile.findUnique({
      where: { storeId },
      include: {
        store: { select: { phone: true, cityDistrict: true } },
        products: { where: { inStock: true } },
      },
    });
  }

  upsert(storeId: string, data: { storeName: string; address?: string; description?: string }) {
    return this.prisma.storeProfile.upsert({
      where: { storeId },
      create: { storeId, ...data },
      update: data,
    });
  }

  getProfile(storeId: string) {
    return this.prisma.storeProfile.findUnique({ where: { storeId } });
  }
}
