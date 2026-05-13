import { PrismaService } from '../prisma/prisma.service';
export declare class StoreService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            products: number;
        };
    } & {
        createdAt: Date;
        storeId: string;
        storeName: string;
        address: string | null;
        description: string | null;
    })[]>;
    findById(storeId: string): import("@prisma/client").Prisma.Prisma__StoreProfileClient<({
        products: {
            name: string;
            id: string;
            createdAt: Date;
            storeId: string;
            description: string | null;
            inStock: boolean;
            price: import("@prisma/client-runtime-utils").Decimal;
            unit: string;
            category: string | null;
        }[];
    } & {
        createdAt: Date;
        storeId: string;
        storeName: string;
        address: string | null;
        description: string | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    upsert(storeId: string, data: {
        storeName: string;
        address?: string;
        description?: string;
    }): import("@prisma/client").Prisma.Prisma__StoreProfileClient<{
        createdAt: Date;
        storeId: string;
        storeName: string;
        address: string | null;
        description: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getProfile(storeId: string): import("@prisma/client").Prisma.Prisma__StoreProfileClient<{
        createdAt: Date;
        storeId: string;
        storeName: string;
        address: string | null;
        description: string | null;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
