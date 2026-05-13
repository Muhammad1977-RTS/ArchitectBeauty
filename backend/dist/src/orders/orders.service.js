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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ORDER_INCLUDE = {
    workType: true,
    client: { select: { id: true, name: true, phone: true } },
    selectedMaster: { select: { id: true, name: true, phone: true } },
    responses: {
        include: { master: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
    },
};
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.order.findMany({
            where: { status: 'new' },
            include: { workType: true, client: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    findByClient(clientId) {
        return this.prisma.order.findMany({
            where: { clientId },
            include: { workType: true, responses: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    create(clientId, data) {
        return this.prisma.order.create({
            data: { ...data, clientId },
            include: { workType: true },
        });
    }
    async selectMaster(orderId, masterId, clientId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException();
        if (order.clientId !== clientId)
            throw new common_1.ForbiddenException();
        if (order.status !== 'new')
            throw new common_1.BadRequestException('Order is not open');
        await this.prisma.response.updateMany({
            where: { orderId },
            data: { status: 'rejected' },
        });
        await this.prisma.response.updateMany({
            where: { orderId, masterId },
            data: { status: 'selected' },
        });
        return this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'master_selected', selectedMasterId: masterId },
            include: ORDER_INCLUDE,
        });
    }
    async complete(orderId, clientId, rating, reviewText) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException();
        if (order.clientId !== clientId)
            throw new common_1.ForbiddenException();
        return this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'completed', rating, reviewText },
            include: ORDER_INCLUDE,
        });
    }
    async delete(orderId, clientId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException();
        if (order.clientId !== clientId)
            throw new common_1.ForbiddenException();
        return this.prisma.order.delete({ where: { id: orderId } });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map