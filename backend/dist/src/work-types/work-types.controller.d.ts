import { WorkTypesService } from './work-types.service';
declare class CreateWorkTypeDto {
    name: string;
    slug: string;
}
export declare class WorkTypesController {
    private svc;
    constructor(svc: WorkTypesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        slug: string;
    }[]>;
    create(dto: CreateWorkTypeDto): import("@prisma/client").Prisma.Prisma__WorkTypeClient<{
        name: string;
        id: string;
        slug: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__WorkTypeClient<{
        name: string;
        id: string;
        slug: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
export {};
