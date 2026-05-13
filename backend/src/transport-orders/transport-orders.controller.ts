import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TransportOrdersService } from './transport-orders.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateTransportOrderDto {
  @IsString() @IsNotEmpty() fromAddress: string;
  @IsString() @IsNotEmpty() toAddress: string;
  @IsString() @IsNotEmpty() cargoDescription: string;
  @IsOptional() @Type(() => Number) @IsNumber() cargoWeightKg?: number;
  @IsOptional() @Type(() => Number) @IsNumber() cargoVolumeM3?: number;
  @IsOptional() @IsString() transportDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() budget?: number;
}

class SelectCarrierDto {
  @IsUUID() carrierId: string;
}

class CompleteDto {
  @Type(() => Number) @IsNumber() @Min(1) rating: number;
  @IsOptional() @IsString() reviewText?: string;
}

@Controller('transport-orders')
export class TransportOrdersController {
  constructor(private svc: TransportOrdersService) {}

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
  create(@CurrentUser() user: any, @Body() dto: CreateTransportOrderDto) {
    return this.svc.create(user.id, dto);
  }

  @Patch(':id/select-carrier')
  selectCarrier(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: SelectCarrierDto) {
    return this.svc.selectCarrier(id, dto.carrierId, user.id);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: CompleteDto) {
    return this.svc.complete(id, user.id, dto.rating, dto.reviewText);
  }
}
