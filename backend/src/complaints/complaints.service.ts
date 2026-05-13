import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.complaint.findMany({
      include: {
        reporter: { select: { id: true, name: true } },
        reportedUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(reporterId: string, data: { reportedUserId: string; reason: string }) {
    return this.prisma.complaint.create({
      data: { ...data, reporterId },
    });
  }

  updateStatus(id: string, status: 'reviewed' | 'dismissed') {
    return this.prisma.complaint.update({ where: { id }, data: { status } });
  }
}
