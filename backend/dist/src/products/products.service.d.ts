import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByStore(storeId: string): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        createdAt: Date;
        description: string | null;
        storeId: string;
        inStock: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        unit: string;
        category: string | null;
    }[]>;
    findById(id: string): import("@prisma/client").Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        createdAt: Date;
        description: string | null;
        storeId: string;
        inStock: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        unit: string;
        category: string | null;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    create(storeId: string, data: {
        name: string;
        description?: string;
        price: number;
        unit: string;
        category?: string;
        inStock?: boolean;
    }): import("@prisma/client").Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        createdAt: Date;
        description: string | null;
        storeId: string;
        inStock: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        unit: string;
        category: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, storeId: string, data: Partial<{
        name: string;
        description: string;
        price: number;
        unit: string;
        category: string;
        inStock: boolean;
    }>): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        description: string | null;
        storeId: string;
        inStock: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        unit: string;
        category: string | null;
    }>;
    remove(id: string, storeId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        description: string | null;
        storeId: string;
        inStock: boolean;
        price: import("@prisma/client-runtime-utils").Decimal;
        unit: string;
        category: string | null;
    }>;
}
