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
exports.TransportOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TransportOrdersService = class TransportOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.transportOrder.findMany({
            where: { status: 'new' },
            include: { client: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    findByClient(clientId) {
        return this.prisma.transportOrder.findMany({
            where: { clientId },
            include: { responses: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const order = await this.prisma.transportOrder.findUnique({
            where: { id },
            include: {
                client: { select: { id: true, name: true, phone: true } },
                selectedCarrier: { select: { id: true, name: true, phone: true } },
                responses: {
                    include: { carrier: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Transport order not found');
        return order;
    }
    create(clientId, data) {
        return this.prisma.transportOrder.create({
            data: {
                ...data,
                clientId,
                transportDate: data.transportDate ? new Date(data.transportDate) : undefined,
            },
        });
    }
    async selectCarrier(orderId, carrierId, clientId) {
        const order = await this.prisma.transportOrder.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException();
        if (order.clientId !== clientId)
            throw new common_1.ForbiddenException();
        if (order.status !== 'new')
            throw new common_1.BadRequestException('Order is not open');
        await this.prisma.transportResponse.updateMany({
            where: { orderId },
            data: { status: 'rejected' },
        });
        await this.prisma.transportResponse.updateMany({
            where: { orderId, carrierId },
            data: { status: 'selected' },
        });
        return this.prisma.transportOrder.update({
            where: { id: orderId },
            data: { status: 'carrier_selected', selectedCarrierId: carrierId },
        });
    }
    async complete(orderId, clientId, rating, reviewText) {
        const order = await this.prisma.transportOrder.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException();
        if (order.clientId !== clientId)
            throw new common_1.ForbiddenException();
        return this.prisma.transportOrder.update({
            where: { id: orderId },
            data: { status: 'completed', rating, reviewText },
        });
    }
};
exports.TransportOrdersService = TransportOrdersService;
exports.TransportOrdersService = TransportOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransportOrdersService);
//# sourceMappingURL=transport-orders.service.js.map