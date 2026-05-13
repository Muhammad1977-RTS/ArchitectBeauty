import { AdminService } from './admin.service';
export declare class AdminController {
    private svc;
    constructor(svc: AdminService);
    users(): import("@prisma/client").Prisma.PrismaPromise<{
        user: {
            email: string;
        };
        name: string;
        role: string;
        id: string;
        createdAt: Date;
        phone: string | null;
        cityDistrict: string | null;
        isAdmin: boolean;
    }[]>;
    deleteUser(id: string): Promise<{
        email: string;
        id: string;
        passwordHash: string;
        createdAt: Date;
    }>;
}
