import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsOptional, IsString } from 'class-validator';

class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() cityDistrict?: string;
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

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.svc.findById(id);
  }
}
