import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email_role: { email: dto.email, role: dto.role } },
    });
    if (exists) throw new ConflictException('This email is already registered for this role');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        role: dto.role,
        passwordHash,
        profile: {
          create: {
            role: dto.role,
            name: dto.name,
          },
        },
      },
      include: { profile: true },
    });

    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    // If role provided — find exact match; otherwise find first account for this email
    const where = dto.role
      ? { email_role: { email: dto.email, role: dto.role } }
      : undefined;

    const user = where
      ? await this.prisma.user.findUnique({ where, include: { profile: true } })
      : await this.prisma.user.findFirst({ where: { email: dto.email }, include: { profile: true } });

    if (!user || !user.profile) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.buildResponse(user);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    await this.prisma.user.findFirst({ where: { email } });
    return { message: 'If this email is registered, a reset link has been sent.' };
  }

  private buildResponse(user: any) {
    const profile = user.profile;
    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: profile.role,
      isAdmin: profile.isAdmin,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: profile.name,
        role: profile.role,
        phone: profile.phone,
        cityDistrict: profile.cityDistrict,
        isAdmin: profile.isAdmin,
      },
    };
  }
}
