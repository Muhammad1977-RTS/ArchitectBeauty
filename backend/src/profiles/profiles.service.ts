import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        masterRates: { include: { workType: true } },
        carrierProfile: true,
        storeProfile: true,
      },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async update(id: string, data: { name?: string; phone?: string; cityDistrict?: string }) {
    return this.prisma.profile.update({
      where: { id },
      data,
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
