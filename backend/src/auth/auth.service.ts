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
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
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
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user || !user.profile) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.buildResponse(user);
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
