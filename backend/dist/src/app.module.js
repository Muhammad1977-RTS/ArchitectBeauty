"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const profiles_module_1 = require("./profiles/profiles.module");
const work_types_module_1 = require("./work-types/work-types.module");
const orders_module_1 = require("./orders/orders.module");
const responses_module_1 = require("./responses/responses.module");
const messages_module_1 = require("./messages/messages.module");
const transport_orders_module_1 = require("./transport-orders/transport-orders.module");
const transport_responses_module_1 = require("./transport-responses/transport-responses.module");
const store_module_1 = require("./store/store.module");
const products_module_1 = require("./products/products.module");
const complaints_module_1 = require("./complaints/complaints.module");
const admin_module_1 = require("./admin/admin.module");
const jwt_guard_1 = require("./common/jwt.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            profiles_module_1.ProfilesModule,
            work_types_module_1.WorkTypesModule,
            orders_module_1.OrdersModule,
            responses_module_1.ResponsesModule,
            messages_module_1.MessagesModule,
            transport_orders_module_1.TransportOrdersModule,
            transport_responses_module_1.TransportResponsesModule,
            store_module_1.StoreModule,
            products_module_1.ProductsModule,
            complaints_module_1.ComplaintsModule,
            admin_module_1.AdminModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_guard_1.JwtAuthGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map