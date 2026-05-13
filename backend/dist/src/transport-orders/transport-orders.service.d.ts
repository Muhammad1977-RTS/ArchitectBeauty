import { PrismaService } from '../prisma/prisma.service';
export declare class TransportOrdersService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findByClient(clientId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    create(clientId: string, data: {
        fromAddress: string;
        toAddress: string;
        cargoDescription: string;
        cargoWeightKg?: number;
        cargoVolumeM3?: number;
        transportDate?: string;
        budget?: number;
    }): import("@prisma/client").Prisma.Prisma__TransportOrderClient<{
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
    selectCarrier(orderId: string, carrierId: string, clientId: string): Promise<{
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
    complete(orderId: string, clientId: string, rating: number, reviewText?: string): Promise<{
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
