import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            phone: any;
            cityDistrict: any;
            isAdmin: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            phone: any;
            cityDistrict: any;
            isAdmin: any;
        };
    }>;
    private buildResponse;
}
