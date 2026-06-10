import { BadRequestException, Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TransportOrdersService } from './transport-orders.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateTransportOrderDto {
  // Flutter sends snake_case — accept both
  @IsOptional() @IsString() @IsNotEmpty() fromAddress?: string;
  @IsOptional() @IsString() @IsNotEmpty() from_address?: string;
  @IsOptional() @IsString() @IsNotEmpty() toAddress?: string;
  @IsOptional() @IsString() @IsNotEmpty() to_address?: string;
  @IsOptional() @IsString() @IsNotEmpty() cargoDescription?: string;
  @IsOptional() @IsString() @IsNotEmpty() cargo_description?: string;
  @IsOptional() @Type(() => Number) @IsNumber() cargoWeightKg?: number;
  @IsOptional() @Type(() => Number) @IsNumber() cargo_weight_kg?: number;
  @IsOptional() @Type(() => Number) @IsNumber() cargoVolumeM3?: number;
  @IsOptional() @IsString() transportDate?: string;
  @IsOptional() @IsString() transport_date?: string;
  @IsOptional() @Type(() => Number) @IsNumber() budget?: number;
}

class SelectCarrierDto {
  @IsUUID() carrierId: string;
}

class RateDto {
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
    const fromAddress = dto.fromAddress ?? dto.from_address;
    const toAddress = dto.toAddress ?? dto.to_address;
    const cargoDescription = dto.cargoDescription ?? dto.cargo_description;
    if (!fromAddress || !toAddress || !cargoDescription) {
      throw new BadRequestException('from_address, to_address and cargo_description are required');
    }
    return this.svc.create(user.id, {
      fromAddress,
      toAddress,
      cargoDescription,
      cargoWeightKg: dto.cargoWeightKg ?? dto.cargo_weight_kg,
      cargoVolumeM3: dto.cargoVolumeM3,
      transportDate: dto.transportDate ?? dto.transport_date,
      budget: dto.budget,
    });
  }

  @Patch(':id/select-carrier')
  selectCarrier(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: SelectCarrierDto) {
    return this.svc.selectCarrier(id, dto.carrierId, user.id);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.complete(id, user.id);
  }

  @Patch(':id/rate')
  rate(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: RateDto) {
    return this.svc.rate(id, user.id, dto.rating, dto.reviewText);
  }
}
