import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
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
}
