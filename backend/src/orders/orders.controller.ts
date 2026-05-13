import { Body, Controller, Delete, Get, Param, Post, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderDto {
  @IsUUID() workTypeId: string;
  @Type(() => Number) @IsNumber() @Min(0.1) areaSqm: number;
  @IsString() @IsNotEmpty() address: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) photoUrls?: string[];
}

class SelectMasterDto {
  @IsUUID() masterId: string;
}

class CompleteOrderDto {
  @IsNumber() @Min(1) rating: number;
  @IsOptional() @IsString() reviewText?: string;
}

@Controller('orders')
export class OrdersController {
  constructor(private svc: OrdersService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('my')
  myOrders(@CurrentUser() user: any) {
    return this.svc.findByClient(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.svc.create(user.id, dto);
  }

  @Patch(':id/select-master')
  selectMaster(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: SelectMasterDto) {
    return this.svc.selectMaster(id, dto.masterId, user.id);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: CompleteOrderDto) {
    return this.svc.complete(id, user.id, dto.rating, dto.reviewText);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.delete(id, user.id);
  }
}
