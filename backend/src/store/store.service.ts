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

  async upsert(storeId: string, data: { storeName: string; address?: string; description?: string; phone?: string }) {
    const { phone, ...storeData } = data;
    const result = await this.prisma.storeProfile.upsert({
      where: { storeId },
      create: { storeId, ...storeData },
      update: storeData,
    });
    if (phone !== undefined) {
      await this.prisma.profile.update({
        where: { id: storeId },
        data: { phone: phone || null },
      });
    }
    return result;
  }

  getProfile(storeId: string) {
    return this.prisma.storeProfile.findUnique({
      where: { storeId },
      include: { store: { select: { phone: true } } },
    });
  }
}
