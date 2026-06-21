import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateFcmTokenDto {
  @IsString() fcm_token: string;
}

class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() cityDistrict?: string;
}

class UpdateCarrierProfileDto {
  @IsOptional() @IsString() vehicleType?: string;
  @IsOptional() @Type(() => Number) @IsNumber() pricePerKm?: number;
  @IsOptional() @Type(() => Number) @IsNumber() minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() maxWeightKg?: number;
}

@Controller('profiles')
export class ProfilesController {
  constructor(private svc: ProfilesService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.svc.findById(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.svc.update(user.id, dto);
  }

  @Get('masters')
  getMasters(@Query('workTypeId') workTypeId?: string) {
    return this.svc.getMasters(workTypeId);
  }

  @Patch('me/carrier-profile')
  updateCarrierProfile(@CurrentUser() user: any, @Body() dto: UpdateCarrierProfileDto) {
    return this.svc.upsertCarrierProfile(user.id, dto);
  }

  @Patch('me/fcm-token')
  updateFcmToken(@CurrentUser() user: any, @Body() dto: UpdateFcmTokenDto) {
    return this.svc.updateFcmToken(user.id, dto.fcm_token);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.svc.findById(id);
  }
}
