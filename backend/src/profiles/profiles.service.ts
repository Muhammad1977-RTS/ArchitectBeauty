import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        masterRates: { include: { workType: true } },
        carrierProfile: true,
        storeProfile: true,
      },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return { ...profile, email: profile.user?.email };
  }

  async update(id: string, data: { name?: string; phone?: string; cityDistrict?: string }) {
    return this.prisma.profile.update({
      where: { id },
      data,
    });
  }

  async upsertCarrierProfile(id: string, data: { vehicleType?: string; pricePerKm?: number; minPrice?: number; maxWeightKg?: number }) {
    return this.prisma.carrierProfile.upsert({
      where: { carrierId: id },
      create: { carrierId: id, vehicleType: (data.vehicleType ?? 'van') as any, pricePerKm: data.pricePerKm, minPrice: data.minPrice, maxWeightKg: data.maxWeightKg },
      update: { vehicleType: data.vehicleType as any, pricePerKm: data.pricePerKm, minPrice: data.minPrice, maxWeightKg: data.maxWeightKg },
    });
  }

  async getMasters(workTypeId?: string) {
    return this.prisma.profile.findMany({
      where: {
        role: 'master',
        ...(workTypeId ? { masterRates: { some: { workTypeId } } } : {}),
      },
      include: {
        masterRates: { include: { workType: true } },
      },
    });
  }
}
