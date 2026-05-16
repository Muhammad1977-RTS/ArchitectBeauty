import { PrismaService } from '../prisma/prisma.service';
export declare class ResponsesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(masterId: string, data: {
        orderId: string;
        proposedPrice: number;
        comment?: string;
        estimatedDays?: number;
    }): Promise<{
        master: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        orderId: string;
        proposedPrice: import("@prisma/client-runtime-utils").Decimal;
        comment: string | null;
        estimatedDays: number | null;
        seen: boolean;
        masterId: string;
    }>;
    findByMaster(masterId: string): import("@prisma/client").Prisma.PrismaPromise<({
        order: {
            workType: {
                name: string;
                id: string;
                slug: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workTypeId: string;
            clientId: string;
            areaSqm: import("@prisma/client-runtime-utils").Decimal;
            address: string;
            description: string | null;
            photoUrls: string[];
            status: string;
            selectedMasterId: string | null;
            rating: number | null;
            reviewText: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        orderId: string;
        proposedPrice: import("@prisma/client-runtime-utils").Decimal;
        comment: string | null;
        estimatedDays: number | null;
        seen: boolean;
        masterId: string;
    })[]>;
    findByOrder(orderId: string): import("@prisma/client").Prisma.PrismaPromise<({
        master: {
            name: string;
            id: string;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        orderId: string;
        proposedPrice: import("@prisma/client-runtime-utils").Decimal;
        comment: string | null;
        estimatedDays: number | null;
        seen: boolean;
        masterId: string;
    })[]>;
    markSeen(orderId: string, userId: string): Promise<void>;
    countUnread(masterId: string): Promise<Record<string, number>>;
}
