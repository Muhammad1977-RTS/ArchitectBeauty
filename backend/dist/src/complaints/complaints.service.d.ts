import { PrismaService } from '../prisma/prisma.service';
export declare class ComplaintsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        reporter: {
            name: string;
            id: string;
        };
        reportedUser: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        reporterId: string;
        reportedUserId: string;
        reason: string;
    })[]>;
    create(reporterId: string, data: {
        reportedUserId: string;
        reason: string;
    }): import("@prisma/client").Prisma.Prisma__ComplaintClient<{
        id: string;
        createdAt: Date;
        status: string;
        reporterId: string;
        reportedUserId: string;
        reason: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateStatus(id: string, status: 'reviewed' | 'dismissed'): import("@prisma/client").Prisma.Prisma__ComplaintClient<{
        id: string;
        createdAt: Date;
        status: string;
        reporterId: string;
        reportedUserId: string;
        reason: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
