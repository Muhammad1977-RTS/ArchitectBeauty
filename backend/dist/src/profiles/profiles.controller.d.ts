import { ProfilesService } from './profiles.service';
declare class UpdateProfileDto {
    name?: string;
    phone?: string;
    cityDistrict?: string;
}
export declare class ProfilesController {
    private svc;
    constructor(svc: ProfilesService);
    getMe(user: any): Promise<{
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
            storeId: string;
            storeName: string;
            address: string | null;
            description: string | null;
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
    updateMe(user: any, dto: UpdateProfileDto): Promise<{
        name: string;
        role: string;
        id: string;
        createdAt: Date;
        phone: string | null;
        cityDistrict: string | null;
        isAdmin: boolean;
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
    getById(id: string): Promise<{
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
            storeId: string;
            storeName: string;
            address: string | null;
            description: string | null;
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
}
export {};
