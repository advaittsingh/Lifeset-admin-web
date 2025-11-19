import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserType } from '@lifeset/shared';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() data: { email?: string; mobile?: string; password: string; userType: UserType }) {
    return this.authService.register(data);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() data: { emailOrMobile: string; password: string }) {
    return this.authService.login(data.emailOrMobile, data.password);
  }

  @Public()
  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP' })
  async sendOtp(@Body() data: { emailOrMobile: string }) {
    return this.authService.generateOtp(data.emailOrMobile);
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  async verifyOtp(@Body() data: { emailOrMobile: string; otp: string }) {
    return this.authService.verifyOtp(data.emailOrMobile, data.otp);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() data: { refreshToken: string }) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@CurrentUser() user: any, @Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(user.id, token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@CurrentUser() user: any) {
    return this.authService.validateUser(user.id);
  }
}

