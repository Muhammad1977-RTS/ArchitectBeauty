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
exports.MasterRatesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const current_user_decorator_1 = require("../common/current-user.decorator");
const class_validator_1 = require("class-validator");
class UpsertRateDto {
    workTypeId;
    ratePerSqm;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertRateDto.prototype, "workTypeId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpsertRateDto.prototype, "ratePerSqm", void 0);
let MasterRatesController = class MasterRatesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsert(user, dto) {
        return this.prisma.masterRate.upsert({
            where: { masterId_workTypeId: { masterId: user.id, workTypeId: dto.workTypeId } },
            create: { masterId: user.id, workTypeId: dto.workTypeId, ratePerSqm: dto.ratePerSqm },
            update: { ratePerSqm: dto.ratePerSqm },
        });
    }
    async remove(user, workTypeId) {
        await this.prisma.masterRate.delete({
            where: { masterId_workTypeId: { masterId: user.id, workTypeId } },
        });
        return { ok: true };
    }
};
exports.MasterRatesController = MasterRatesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpsertRateDto]),
    __metadata("design:returntype", Promise)
], MasterRatesController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)(':workTypeId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MasterRatesController.prototype, "remove", null);
exports.MasterRatesController = MasterRatesController = __decorate([
    (0, common_1.Controller)('master-rates'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MasterRatesController);
//# sourceMappingURL=master-rates.controller.js.map