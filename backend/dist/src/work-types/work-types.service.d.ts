import { PrismaService } from '../prisma/prisma.service';
export declare class WorkTypesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        slug: string;
    }[]>;
    create(data: {
        name: string;
        slug: string;
    }): import("@prisma/client").Prisma.Prisma__WorkTypeClient<{
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
