import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { WorkTypesModule } from './work-types/work-types.module';
import { OrdersModule } from './orders/orders.module';
import { ResponsesModule } from './responses/responses.module';
import { MessagesModule } from './messages/messages.module';
import { TransportOrdersModule } from './transport-orders/transport-orders.module';
import { TransportResponsesModule } from './transport-responses/transport-responses.module';
import { StoreModule } from './store/store.module';
import { ProductsModule } from './products/products.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { AdminModule } from './admin/admin.module';
import { MasterRatesModule } from './master-rates/master-rates.module';
import { JwtAuthGuard } from './common/jwt.guard';
import { SnakeCaseInterceptor } from './common/snake-case.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProfilesModule,
    WorkTypesModule,
    OrdersModule,
    ResponsesModule,
    MessagesModule,
    TransportOrdersModule,
    TransportResponsesModule,
    StoreModule,
    ProductsModule,
    ComplaintsModule,
    AdminModule,
    MasterRatesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: SnakeCaseInterceptor },
  ],
})
export class AppModule {}
