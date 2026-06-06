import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() description?: string;
  @Type(() => Number) @IsNumber() @Min(0) price: number;
  @IsString() @IsNotEmpty() unit: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsBoolean() inStock?: boolean;
}

class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsBoolean() inStock?: boolean;
}

@Controller('products')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('my')
  myProducts(@CurrentUser() user: any) {
    return this.svc.findByStore(user.id);
  }

  @Get('by-store/:storeId')
  byStore(@Param('storeId') storeId: string) {
    return this.svc.findByStore(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    return this.svc.create(user.id, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateProductDto) {
    return this.svc.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.remove(id, user.id);
  }
}
