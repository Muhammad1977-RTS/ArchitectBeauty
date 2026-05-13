import { TransportOrdersService } from './transport-orders.service';
declare class CreateTransportOrderDto {
    fromAddress: string;
    toAddress: string;
    cargoDescription: string;
    cargoWeightKg?: number;
    cargoVolumeM3?: number;
    transportDate?: string;
    budget?: number;
}
declare class SelectCarrierDto {
    carrierId: string;
}
declare class CompleteDto {
    rating: number;
    reviewText?: string;
}
export declare class TransportOrdersController {
    private svc;
    constructor(svc: TransportOrdersService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        client: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        status: string;
        rating: number | null;
        reviewText: string | null;
        fromAddress: string;
        toAddress: string;
        cargoDescription: string;
        cargoWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
        cargoVolumeM3: import("@prisma/client-runtime-utils").Decimal | null;
        transportDate: Date | null;
        budget: import("@prisma/client-runtime-utils").Decimal | null;
        selectedCarrierId: string | null;
    })[]>;
    myOrders(user: any): import("@prisma/client").Prisma.PrismaPromise<({
        responses: {
            id: string;
            createdAt: Date;
            carrierId: string;
            vehicleType: string | null;
            status: string;
            orderId: string;
            proposedPrice: import("@prisma/client-runtime-utils").Decimal;
            comment: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        status: string;
        rating: number | null;
        reviewText: string | null;
        fromAddress: string;
        toAddress: string;
        cargoDescription: string;
        cargoWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
        cargoVolumeM3: import("@prisma/client-runtime-utils").Decimal | null;
        transportDate: Date | null;
        budget: import("@prisma/client-runtime-utils").Decimal | null;
        selectedCarrierId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        client: {
            name: string;
            id: string;
            phone: string | null;
        };
        responses: ({
            carrier: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            carrierId: string;
            vehicleType: string | null;
            status: string;
            orderId: string;
            proposedPrice: import("@prisma/client-runtime-utils").Decimal;
            comment: string | null;
        })[];
        selectedCarrier: {
            name: string;
            id: string;
            phone: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        status: string;
        rating: number | null;
        reviewText: string | null;
        fromAddress: string;
        toAddress: string;
        cargoDescription: string;
        cargoWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
        cargoVolumeM3: import("@prisma/client-runtime-utils").Decimal | null;
        transportDate: Date | null;
        budget: import("@prisma/client-runtime-utils").Decimal | null;
        selectedCarrierId: string | null;
    }>;
    create(user: any, dto: CreateTransportOrderDto): import("@prisma/client").Prisma.Prisma__TransportOrderClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        status: string;
        rating: number | null;
        reviewText: string | null;
        fromAddress: string;
        toAddress: string;
        cargoDescription: string;
        cargoWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
        cargoVolumeM3: import("@prisma/client-runtime-utils").Decimal | null;
        transportDate: Date | null;
        budget: import("@prisma/client-runtime-utils").Decimal | null;
        selectedCarrierId: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    selectCarrier(id: string, user: any, dto: SelectCarrierDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        status: string;
        rating: number | null;
        reviewText: string | null;
        fromAddress: string;
        toAddress: string;
        cargoDescription: string;
        cargoWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
        cargoVolumeM3: import("@prisma/client-runtime-utils").Decimal | null;
        transportDate: Date | null;
        budget: import("@prisma/client-runtime-utils").Decimal | null;
        selectedCarrierId: string | null;
    }>;
    complete(id: string, user: any, dto: CompleteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        status: string;
        rating: number | null;
        reviewText: string | null;
        fromAddress: string;
        toAddress: string;
        cargoDescription: string;
        cargoWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
        cargoVolumeM3: import("@prisma/client-runtime-utils").Decimal | null;
        transportDate: Date | null;
        budget: import("@prisma/client-runtime-utils").Decimal | null;
        selectedCarrierId: string | null;
    }>;
}
export {};
