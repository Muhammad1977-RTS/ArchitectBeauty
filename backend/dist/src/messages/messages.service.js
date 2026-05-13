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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MessagesService = class MessagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findByOrder(orderId) {
        return this.prisma.message.findMany({
            where: { orderId },
            include: { sender: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    send(orderId, senderId, content) {
        return this.prisma.message.create({
            data: { orderId, senderId, content },
            include: { sender: { select: { id: true, name: true, role: true } } },
        });
    }
    async markRead(orderId, userId) {
        await this.prisma.message.updateMany({
            where: { orderId, senderId: { not: userId }, readAt: null },
            data: { readAt: new Date() },
        });
    }
    async countUnread(userId) {
        const messages = await this.prisma.message.findMany({
            where: { readAt: null, senderId: { not: userId } },
            select: { orderId: true },
        });
        const counts = {};
        for (const m of messages) {
            counts[m.orderId] = (counts[m.orderId] || 0) + 1;
        }
        return counts;
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map