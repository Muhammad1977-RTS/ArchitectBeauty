import { Module } from '@nestjs/common';
import { MasterRatesController } from './master-rates.controller';

@Module({ controllers: [MasterRatesController] })
export class MasterRatesModule {}
