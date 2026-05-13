import { Module } from '@nestjs/common';
import { TransportResponsesController } from './transport-responses.controller';
import { TransportResponsesService } from './transport-responses.service';

@Module({
  controllers: [TransportResponsesController],
  providers: [TransportResponsesService],
})
export class TransportResponsesModule {}
