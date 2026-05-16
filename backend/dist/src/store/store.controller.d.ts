import { StoreService } from './store.service';
declare class UpsertStoreDto {
    storeName: string;
    address?: string;
    description?: string;
}
export declare class StoreController {
    private svc;
    constructor(svc: StoreService);
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
    getMyProfile(user: any): import("@prisma/client").Prisma.Prisma__StoreProfileClient<{
        createdAt: Date;
        address: string | null;
        description: string | null;
        storeId: string;
        storeName: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__StoreProfileClient<({
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
    upsert(user: any, dto: UpsertStoreDto): import("@prisma/client").Prisma.Prisma__StoreProfileClient<{
        createdAt: Date;
        address: string | null;
        description: string | null;
        storeId: string;
        storeName: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
export {};
