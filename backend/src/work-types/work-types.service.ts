import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkTypesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.workType.findMany({ orderBy: { name: 'asc' } });
  }

  create(data: { name: string; slug: string }) {
    return this.prisma.workType.create({ data });
  }

  remove(id: string) {
    return this.prisma.workType.delete({ where: { id } });
  }
}
