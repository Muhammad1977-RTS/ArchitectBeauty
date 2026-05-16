import { PrismaService } from '../prisma/prisma.service';
export declare class ProfilesService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        carrierProfile: {
            carrierId: string;
            vehicleType: string;
            pricePerKm: import("@prisma/client-runtime-utils").Decimal | null;
            minPrice: import("@prisma/client-runtime-utils").Decimal | null;
            maxWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
            updatedAt: Date;
        } | null;
        storeProfile: {
            createdAt: Date;
            address: string | null;
            description: string | null;
            storeId: string;
            storeName: string;
        } | null;
        masterRates: ({
            workType: {
                name: string;
                id: string;
                slug: string;
            };
        } & {
            id: string;
            workTypeId: string;
            masterId: string;
            ratePerSqm: import("@prisma/client-runtime-utils").Decimal;
        })[];
    } & {
        name: string;
        role: string;
        id: string;
        createdAt: Date;
        phone: string | null;
        cityDistrict: string | null;
        isAdmin: boolean;
    }>;
    update(id: string, data: {
        name?: string;
        phone?: string;
        cityDistrict?: string;
    }): Promise<{
        name: string;
        role: string;
        id: string;
        createdAt: Date;
        phone: string | null;
        cityDistrict: string | null;
        isAdmin: boolean;
    }>;
    upsertCarrierProfile(id: string, data: {
        vehicleType?: string;
        pricePerKm?: number;
        minPrice?: number;
        maxWeightKg?: number;
    }): Promise<{
        carrierId: string;
        vehicleType: string;
        pricePerKm: import("@prisma/client-runtime-utils").Decimal | null;
        minPrice: import("@prisma/client-runtime-utils").Decimal | null;
        maxWeightKg: import("@prisma/client-runtime-utils").Decimal | null;
        updatedAt: Date;
    }>;
    getMasters(workTypeId?: string): Promise<({
        masterRates: ({
            workType: {
                name: string;
                id: string;
                slug: string;
            };
        } & {
            id: string;
            workTypeId: string;
            masterId: string;
            ratePerSqm: import("@prisma/client-runtime-utils").Decimal;
        })[];
    } & {
        name: string;
        role: string;
        id: string;
        createdAt: Date;
        phone: string | null;
        cityDistrict: string | null;
        isAdmin: boolean;
    })[]>;
}
