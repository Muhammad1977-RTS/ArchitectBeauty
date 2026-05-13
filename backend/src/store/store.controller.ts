import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { StoreService } from './store.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class UpsertStoreDto {
  @IsString() @IsNotEmpty() storeName: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() description?: string;
}

@Controller('store')
export class StoreController {
  constructor(private svc: StoreService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('my')
  getMyProfile(@CurrentUser() user: any) {
    return this.svc.getProfile(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Put('my')
  upsert(@CurrentUser() user: any, @Body() dto: UpsertStoreDto) {
    return this.svc.upsert(user.id, dto);
  }
}
