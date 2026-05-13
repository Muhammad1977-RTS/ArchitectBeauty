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
        masterId: string;
        status: string;
        orderId: string;
        proposedPrice: import("@prisma/client-runtime-utils").Decimal;
        comment: string | null;
        estimatedDays: number | null;
        seen: boolean;
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
    findByOrder(orderId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    markSeen(orderId: string, userId: string): Promise<void>;
    countUnread(masterId: string): Promise<Record<string, number>>;
}
