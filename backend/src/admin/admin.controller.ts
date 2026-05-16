import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../common/admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private svc: AdminService) {}

  @Get('users')
  users(@Query('role') role?: string) {
    return this.svc.findAllUsers(role);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.svc.deleteUser(id);
  }
}
