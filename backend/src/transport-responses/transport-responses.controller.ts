import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransportResponsesService } from './transport-responses.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateTransportResponseDto {
  @IsUUID() orderId: string;
  @Type(() => Number) @IsNumber() @Min(1) proposedPrice: number;
  @IsOptional() @IsString() comment?: string;
  @IsOptional() @IsString() vehicleType?: string;
}

@Controller('transport-responses')
export class TransportResponsesController {
  constructor(private svc: TransportResponsesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateTransportResponseDto) {
    return this.svc.create(user.id, dto);
  }

  @Get('my')
  myResponses(@CurrentUser() user: any) {
    return this.svc.findByCarrier(user.id);
  }

  @Get('by-order/:orderId')
  byOrder(@Param('orderId') orderId: string) {
    return this.svc.findByOrder(orderId);
  }

  @Get('unseen-counts')
  unseenCounts(@CurrentUser() user: any) {
    return this.svc.countUnseenForClient(user.id);
  }

  @Post('order/:orderId/seen')
  markSeen(@Param('orderId') orderId: string, @CurrentUser() user: any) {
    return this.svc.markSeen(orderId, user.id);
  }
}
