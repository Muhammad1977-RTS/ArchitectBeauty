import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CurrentUser } from '../common/current-user.decorator';
import { AdminGuard } from '../common/admin.guard';
import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

class CreateComplaintDto {
  @IsUUID() reportedUserId: string;
  @IsString() @IsNotEmpty() reason: string;
}

class UpdateStatusDto {
  @IsIn(['reviewed', 'dismissed']) status: 'reviewed' | 'dismissed';
}

@Controller('complaints')
export class ComplaintsController {
  constructor(private svc: ComplaintsService) {}

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateComplaintDto) {
    return this.svc.create(user.id, dto);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.svc.updateStatus(id, dto.status);
  }
}
