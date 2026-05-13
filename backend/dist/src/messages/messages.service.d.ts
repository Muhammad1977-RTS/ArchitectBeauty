import { PrismaService } from '../prisma/prisma.service';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    findByOrder(orderId: string): import("@prisma/client").Prisma.PrismaPromise<({
        sender: {
            name: string;
            role: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        orderId: string;
        senderId: string;
        content: string;
        readAt: Date | null;
    })[]>;
    send(orderId: string, senderId: string, content: string): import("@prisma/client").Prisma.Prisma__MessageClient<{
        sender: {
            name: string;
            role: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        orderId: string;
        senderId: string;
        content: string;
        readAt: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    markRead(orderId: string, userId: string): Promise<void>;
    countUnread(userId: string): Promise<Record<string, number>>;
}
