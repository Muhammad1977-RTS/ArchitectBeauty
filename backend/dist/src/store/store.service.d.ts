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
        address: string | null;
        description: string | null;
        storeId: string;
        storeName: string;
    })[]>;
    findById(storeId: string): import("@prisma/client").Prisma.Prisma__StoreProfileClient<({
        products: {
            name: string;
            id: string;
            createdAt: Date;
            description: string | null;
            storeId: string;
            inStock: boolean;
            price: import("@prisma/client-runtime-utils").Decimal;
            unit: string;
            category: string | null;
        }[];
    } & {
        createdAt: Date;
        address: string | null;
        description: string | null;
        storeId: string;
        storeName: string;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    upsert(storeId: string, data: {
        storeName: string;
        address?: string;
        description?: string;
    }): import("@prisma/client").Prisma.Prisma__StoreProfileClient<{
        createdAt: Date;
        address: string | null;
        description: string | null;
        storeId: string;
        storeName: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getProfile(storeId: string): import("@prisma/client").Prisma.Prisma__StoreProfileClient<{
        createdAt: Date;
        address: string | null;
        description: string | null;
        storeId: string;
        storeName: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
