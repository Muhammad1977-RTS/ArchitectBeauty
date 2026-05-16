import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  findAllUsers(role?: string) {
    return this.prisma.profile.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true, name: true, role: true, phone: true,
        cityDistrict: true, isAdmin: true, createdAt: true,
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
