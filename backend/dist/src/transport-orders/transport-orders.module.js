"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportOrdersModule = void 0;
const common_1 = require("@nestjs/common");
const transport_orders_controller_1 = require("./transport-orders.controller");
const transport_orders_service_1 = require("./transport-orders.service");
let TransportOrdersModule = class TransportOrdersModule {
};
exports.TransportOrdersModule = TransportOrdersModule;
exports.TransportOrdersModule = TransportOrdersModule = __decorate([
    (0, common_1.Module)({
        controllers: [transport_orders_controller_1.TransportOrdersController],
        providers: [transport_orders_service_1.TransportOrdersService],
    })
], TransportOrdersModule);
//# sourceMappingURL=transport-orders.module.js.map