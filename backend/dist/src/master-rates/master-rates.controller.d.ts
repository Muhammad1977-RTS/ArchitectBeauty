import { PrismaService } from '../prisma/prisma.service';
declare class UpsertRateDto {
    workTypeId: string;
    ratePerSqm: number;
}
export declare class MasterRatesController {
    private prisma;
    constructor(prisma: PrismaService);
    upsert(user: any, dto: UpsertRateDto): Promise<{
        id: string;
        workTypeId: string;
        masterId: string;
        ratePerSqm: import("@prisma/client-runtime-utils").Decimal;
    }>;
    remove(user: any, workTypeId: string): Promise<{
        ok: boolean;
    }>;
}
export {};
