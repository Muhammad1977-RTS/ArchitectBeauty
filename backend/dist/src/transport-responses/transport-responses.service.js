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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportResponsesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TransportResponsesService = class TransportResponsesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(carrierId, data) {
        const exists = await this.prisma.transportResponse.findUnique({
            where: { orderId_carrierId: { orderId: data.orderId, carrierId } },
        });
        if (exists)
            throw new common_1.ConflictException('Already responded');
        return this.prisma.transportResponse.create({
            data: { ...data, carrierId },
        });
    }
    findByCarrier(carrierId) {
        return this.prisma.transportResponse.findMany({
            where: { carrierId },
            include: { order: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    findByOrder(orderId) {
        return this.prisma.transportResponse.findMany({
            where: { orderId },
            include: { carrier: { select: { id: true, name: true, phone: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.TransportResponsesService = TransportResponsesService;
exports.TransportResponsesService = TransportResponsesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransportResponsesService);
//# sourceMappingURL=transport-responses.service.js.map