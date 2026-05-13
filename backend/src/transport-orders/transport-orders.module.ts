import { Module } from '@nestjs/common';
import { TransportOrdersController } from './transport-orders.controller';
import { TransportOrdersService } from './transport-orders.service';

@Module({
  controllers: [TransportOrdersController],
  providers: [TransportOrdersService],
})
export class TransportOrdersModule {}
