import { Module } from '@nestjs/common';
import { TransportMessagesController } from './transport-messages.controller';
import { TransportMessagesService } from './transport-messages.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TransportMessagesController],
  providers: [TransportMessagesService],
  exports: [TransportMessagesService],
})
export class TransportMessagesModule {}
