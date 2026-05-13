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
exports.ResponsesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ResponsesService = class ResponsesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(masterId, data) {
        const exists = await this.prisma.response.findUnique({
            where: { orderId_masterId: { orderId: data.orderId, masterId } },
        });
        if (exists)
            throw new common_1.ConflictException('Already responded');
        return this.prisma.response.create({
            data: { ...data, masterId },
            include: { master: { select: { id: true, name: true } } },
        });
    }
    findByMaster(masterId) {
        return this.prisma.response.findMany({
            where: { masterId },
            include: {
                order: { include: { workType: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    findByOrder(orderId) {
        return this.prisma.response.findMany({
            where: { orderId },
            include: { master: { select: { id: true, name: true, phone: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async markSeen(orderId, userId) {
        await this.prisma.response.updateMany({
            where: { orderId, seen: false },
            data: { seen: true },
        });
    }
    async countUnread(masterId) {
        const responses = await this.prisma.response.findMany({
            where: { masterId, status: 'selected', seen: false },
            select: { orderId: true },
        });
        const counts = {};
        for (const r of responses) {
            counts[r.orderId] = (counts[r.orderId] || 0) + 1;
        }
        return counts;
    }
};
exports.ResponsesService = ResponsesService;
exports.ResponsesService = ResponsesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResponsesService);
//# sourceMappingURL=responses.service.js.map