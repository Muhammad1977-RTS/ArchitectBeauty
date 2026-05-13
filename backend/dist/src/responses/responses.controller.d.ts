import { ResponsesService } from './responses.service';
declare class CreateResponseDto {
    orderId: string;
    proposedPrice: number;
    comment?: string;
    estimatedDays?: number;
}
export declare class ResponsesController {
    private svc;
    constructor(svc: ResponsesService);
    create(user: any, dto: CreateResponseDto): Promise<{
        master: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        masterId: string;
        status: string;
        orderId: string;
        proposedPrice: import("@prisma/client-runtime-utils").Decimal;
        comment: string | null;
        estimatedDays: number | null;
        seen: boolean;
    }>;
    myResponses(user: any): import("@prisma/client").Prisma.PrismaPromise<({
        order: {
            workType: {
                name: string;
                id: string;
                slug: string;
            };
        } & {
            id: string;
            createdAt: Date;
            workTypeId: string;
            updatedAt: Date;
            address: string;
            description: string | null;
            clientId: string;
            areaSqm: import("@prisma/client-runtime-utils").Decimal;
            photoUrls: string[];
            status: string;
            selectedMasterId: string | null;
            rating: number | null;
            reviewText: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        masterId: string;
        status: string;
        orderId: string;
        proposedPrice: import("@prisma/client-runtime-utils").Decimal;
        comment: string | null;
        estimatedDays: number | null;
        seen: boolean;
    })[]>;
    byOrder(orderId: string): import("@prisma/client").Prisma.PrismaPromise<({
        master: {
            name: string;
            id: string;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        masterId: string;
        status: string;
        orderId: string;
        proposedPrice: import("@prisma/client-runtime-utils").Decimal;
        comment: string | null;
        estimatedDays: number | null;
        seen: boolean;
    })[]>;
}
export {};
