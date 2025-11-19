import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { UserType } from '@lifeset/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
    private configService: ConfigService,
  ) {}

  async register(data: {
    email?: string;
    mobile?: string;
    password: string;
    userType: UserType;
  }) {
    // Check if user exists
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }
    }

    if (data.mobile) {
      const existingUser = await this.prisma.user.findUnique({
        where: { mobile: data.mobile },
      });
      if (existingUser) {
        throw new BadRequestException('Mobile already registered');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        mobile: data.mobile,
        password: hashedPassword,
        userType: data.userType,
      },
    });

    return {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      userType: user.userType,
    };
  }

  async login(emailOrMobile: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrMobile },
          { mobile: emailOrMobile },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const tokens = await this.generateTokens(user);

    // Store session
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        userType: user.userType,
      },
      ...tokens,
    };
  }

  async generateOtp(emailOrMobile: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `otp:${emailOrMobile}`;
    
    // Store OTP in Redis with 10 minute expiration
    await this.redis.set(key, otp, 600);

    // TODO: Send OTP via SMS/Email queue
    // await this.queueService.addSMSJob({ to: emailOrMobile, otp });

    return { success: true, message: 'OTP sent successfully' };
  }

  async verifyOtp(emailOrMobile: string, otp: string) {
    const key = `otp:${emailOrMobile}`;
    const storedOtp = await this.redis.get(key);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Delete OTP after verification
    await this.redis.del(key);

    return { success: true, message: 'OTP verified' };
  }

  async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      mobile: user.mobile,
      userType: user.userType,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, token: string) {
    // Add token to blacklist
    await this.redis.set(`blacklist:${token}`, '1', 900); // 15 minutes

    // Delete session
    await this.prisma.session.deleteMany({
      where: { userId, token },
    });

    return { success: true, message: 'Logged out successfully' };
  }

  async createSession(userId: string, token: string, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.session.create({
      data: {
        userId,
        token,
        refreshToken,
        expiresAt,
      },
    });
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        companyProfile: true,
        collegeProfile: true,
        adminProfile: true,
      },
    });
  }
}

