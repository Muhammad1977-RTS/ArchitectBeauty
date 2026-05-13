import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsNumber, IsString } from 'class-validator';

class UpsertRateDto {
  @IsString() workTypeId!: string;
  @IsNumber() ratePerSqm!: number;
}

@Controller('master-rates')
export class MasterRatesController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async upsert(@CurrentUser() user: any, @Body() dto: UpsertRateDto) {
    return this.prisma.masterRate.upsert({
      where: { masterId_workTypeId: { masterId: user.id, workTypeId: dto.workTypeId } },
      create: { masterId: user.id, workTypeId: dto.workTypeId, ratePerSqm: dto.ratePerSqm },
      update: { ratePerSqm: dto.ratePerSqm },
    });
  }

  @Delete(':workTypeId')
  async remove(@CurrentUser() user: any, @Param('workTypeId') workTypeId: string) {
    await this.prisma.masterRate.delete({
      where: { masterId_workTypeId: { masterId: user.id, workTypeId } },
    });
    return { ok: true };
  }
}
