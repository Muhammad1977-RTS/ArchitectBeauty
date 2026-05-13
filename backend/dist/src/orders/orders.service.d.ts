import { PrismaService } from '../prisma/prisma.service';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        workType: {
            name: string;
            id: string;
            slug: string;
        };
        client: {
            name: string;
            id: string;
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
    })[]>;
    findByClient(clientId: string): import("@prisma/client").Prisma.PrismaPromise<({
        workType: {
            name: string;
            id: string;
            slug: string;
        };
        responses: {
            id: string;
            createdAt: Date;
            masterId: string;
            status: string;
            orderId: string;
            proposedPrice: import("@prisma/client-runtime-utils").Decimal;
            comment: string | null;
            estimatedDays: number | null;
            seen: boolean;
        }[];
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
    })[]>;
    findOne(id: string): Promise<{
        workType: {
            name: string;
            id: string;
            slug: string;
        };
        client: {
            name: string;
            id: string;
            phone: string | null;
        };
        responses: ({
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
        })[];
        selectedMaster: {
            name: string;
            id: string;
            phone: string | null;
        } | null;
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
    }>;
    create(clientId: string, data: {
        workTypeId: string;
        areaSqm: number;
        address: string;
        description?: string;
        photoUrls?: string[];
    }): import("@prisma/client").Prisma.Prisma__OrderClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    selectMaster(orderId: string, masterId: string, clientId: string): Promise<{
        workType: {
            name: string;
            id: string;
            slug: string;
        };
        client: {
            name: string;
            id: string;
            phone: string | null;
        };
        responses: ({
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
        })[];
        selectedMaster: {
            name: string;
            id: string;
            phone: string | null;
        } | null;
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
    }>;
    complete(orderId: string, clientId: string, rating: number, reviewText?: string): Promise<{
        workType: {
            name: string;
            id: string;
            slug: string;
        };
        client: {
            name: string;
            id: string;
            phone: string | null;
        };
        responses: ({
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
        })[];
        selectedMaster: {
            name: string;
            id: string;
            phone: string | null;
        } | null;
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
    }>;
    delete(orderId: string, clientId: string): Promise<{
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
    }>;
}
