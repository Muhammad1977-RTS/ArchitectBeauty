import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateResponseDto {
  @IsUUID() orderId: string;
  @Type(() => Number) @IsNumber() @Min(1) proposedPrice: number;
  @IsOptional() @IsString() comment?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) estimatedDays?: number;
}

@Controller('responses')
export class ResponsesController {
  constructor(private svc: ResponsesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateResponseDto) {
    return this.svc.create(user.id, dto);
  }

  @Get('my')
  myResponses(@CurrentUser() user: any) {
    return this.svc.findByMaster(user.id);
  }

  @Get('by-order/:orderId')
  byOrder(@Param('orderId') orderId: string) {
    return this.svc.findByOrder(orderId);
  }
}
