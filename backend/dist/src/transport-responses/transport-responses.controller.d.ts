import { TransportResponsesService } from './transport-responses.service';
declare class CreateTransportResponseDto {
    orderId: string;
    proposedPrice: number;
    comment?: string;
    vehicleType?: string;
}
export declare class TransportResponsesController {
    private svc;
    constructor(svc: TransportResponsesService);
    create(user: any, dto: CreateTransportResponseDto): Promise<{
        id: string;
        createdAt: Date;
        carrierId: string;
        vehicleType: string | null;
        status: string;
        orderId: string;
        proposedPrice: import("@prisma/client-runtime-utils").Decimal;
        comment: string | null;
    }>;
    myResponses(user: any): import("@prisma/client").Prisma.PrismaPromise<({
        order: {
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
    })[]>;
    byOrder(orderId: string): import("@prisma/client").Prisma.PrismaPromise<({
        carrier: {
            name: string;
            id: string;
            phone: string | null;
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
    })[]>;
}
export {};
