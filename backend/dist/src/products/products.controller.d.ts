import { ProductsService } from './products.service';
declare class CreateProductDto {
    name: string;
    description?: string;
    price: number;
    unit: string;
    category?: string;
    inStock?: boolean;
}
declare class UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    unit?: string;
    category?: string;
    inStock?: boolean;
}
export declare class ProductsController {
    private svc;
    constructor(svc: ProductsService);
    myProducts(user: any): import("@prisma/client").Prisma.PrismaPromise<{
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
    byStore(storeId: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    findOne(id: string): import("@prisma/client").Prisma.Prisma__ProductClient<{
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
    create(user: any, dto: CreateProductDto): import("@prisma/client").Prisma.Prisma__ProductClient<{
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
    update(id: string, user: any, dto: UpdateProductDto): Promise<{
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
    remove(id: string, user: any): Promise<{
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
export {};
