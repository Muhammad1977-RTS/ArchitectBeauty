import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WorkTypesService } from './work-types.service';
import { AdminGuard } from '../common/admin.guard';
import { Public } from '../common/public.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateWorkTypeDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() slug: string;
}

@Controller('work-types')
export class WorkTypesController {
  constructor(private svc: WorkTypesService) {}

  @Public()
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateWorkTypeDto) {
    return this.svc.create(dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
