import { MessagesService } from './messages.service';
declare class SendMessageDto {
    content: string;
}
export declare class MessagesController {
    private svc;
    constructor(svc: MessagesService);
    byOrder(orderId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    send(orderId: string, user: any, dto: SendMessageDto): import("@prisma/client").Prisma.Prisma__MessageClient<{
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
    markRead(orderId: string, user: any): Promise<void>;
    unread(user: any): Promise<Record<string, number>>;
}
export {};
