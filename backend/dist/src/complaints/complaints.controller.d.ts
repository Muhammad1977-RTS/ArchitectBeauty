import { ComplaintsService } from './complaints.service';
declare class CreateComplaintDto {
    reportedUserId: string;
    reason: string;
}
declare class UpdateStatusDto {
    status: 'reviewed' | 'dismissed';
}
export declare class ComplaintsController {
    private svc;
    constructor(svc: ComplaintsService);
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
    create(user: any, dto: CreateComplaintDto): import("@prisma/client").Prisma.Prisma__ComplaintClient<{
        id: string;
        createdAt: Date;
        status: string;
        reporterId: string;
        reportedUserId: string;
        reason: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateStatus(id: string, dto: UpdateStatusDto): import("@prisma/client").Prisma.Prisma__ComplaintClient<{
        id: string;
        createdAt: Date;
        status: string;
        reporterId: string;
        reportedUserId: string;
        reason: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
export {};
