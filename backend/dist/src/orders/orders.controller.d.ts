import { OrdersService } from './orders.service';
declare class CreateOrderDto {
    workTypeId: string;
    areaSqm: number;
    address: string;
    description?: string;
    photoUrls?: string[];
}
declare class SelectMasterDto {
    masterId: string;
}
declare class CompleteOrderDto {
    rating: number;
    reviewText?: string;
}
export declare class OrdersController {
    private svc;
    constructor(svc: OrdersService);
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
    myOrders(user: any): import("@prisma/client").Prisma.PrismaPromise<({
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
    create(user: any, dto: CreateOrderDto): import("@prisma/client").Prisma.Prisma__OrderClient<{
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
    selectMaster(id: string, user: any, dto: SelectMasterDto): Promise<{
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
    complete(id: string, user: any, dto: CompleteOrderDto): Promise<{
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
    remove(id: string, user: any): Promise<{
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
export {};
