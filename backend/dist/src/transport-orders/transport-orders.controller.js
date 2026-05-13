"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportOrdersController = void 0;
const common_1 = require("@nestjs/common");
const transport_orders_service_1 = require("./transport-orders.service");
const current_user_decorator_1 = require("../common/current-user.decorator");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateTransportOrderDto {
    fromAddress;
    toAddress;
    cargoDescription;
    cargoWeightKg;
    cargoVolumeM3;
    transportDate;
    budget;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransportOrderDto.prototype, "fromAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransportOrderDto.prototype, "toAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransportOrderDto.prototype, "cargoDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransportOrderDto.prototype, "cargoWeightKg", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransportOrderDto.prototype, "cargoVolumeM3", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransportOrderDto.prototype, "transportDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransportOrderDto.prototype, "budget", void 0);
class SelectCarrierDto {
    carrierId;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SelectCarrierDto.prototype, "carrierId", void 0);
class CompleteDto {
    rating;
    reviewText;
}
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CompleteDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteDto.prototype, "reviewText", void 0);
let TransportOrdersController = class TransportOrdersController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    findAll() {
        return this.svc.findAll();
    }
    myOrders(user) {
        return this.svc.findByClient(user.id);
    }
    findOne(id) {
        return this.svc.findOne(id);
    }
    create(user, dto) {
        return this.svc.create(user.id, dto);
    }
    selectCarrier(id, user, dto) {
        return this.svc.selectCarrier(id, dto.carrierId, user.id);
    }
    complete(id, user, dto) {
        return this.svc.complete(id, user.id, dto.rating, dto.reviewText);
    }
};
exports.TransportOrdersController = TransportOrdersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransportOrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TransportOrdersController.prototype, "myOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransportOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateTransportOrderDto]),
    __metadata("design:returntype", void 0)
], TransportOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/select-carrier'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, SelectCarrierDto]),
    __metadata("design:returntype", void 0)
], TransportOrdersController.prototype, "selectCarrier", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, CompleteDto]),
    __metadata("design:returntype", void 0)
], TransportOrdersController.prototype, "complete", null);
exports.TransportOrdersController = TransportOrdersController = __decorate([
    (0, common_1.Controller)('transport-orders'),
    __metadata("design:paramtypes", [transport_orders_service_1.TransportOrdersService])
], TransportOrdersController);
//# sourceMappingURL=transport-orders.controller.js.map