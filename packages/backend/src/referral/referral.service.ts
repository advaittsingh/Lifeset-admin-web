import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ReferralService {
  private whatsappApiKey: string;
  private whatsappApiUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.whatsappApiKey = this.configService.get<string>('WHATSAPP_API_KEY') || '';
    this.whatsappApiUrl = this.configService.get<string>('WHATSAPP_API_URL') || '';
  }

  async createReferral(referrerId: string, referredEmail?: string, referredMobile?: string) {
    // Find or create referral
    const referral = await this.prisma.referral.upsert({
      where: {
        referrerId_referredEmail: {
          referrerId,
          referredEmail: referredEmail || '',
        },
      },
      update: {},
      create: {
        referrerId,
        referredEmail,
        referredMobile,
        status: 'PENDING',
      },
    });

    return referral;
  }

  async getMyReferralCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user?.referralCode) {
      // Generate referral code if doesn't exist
      const code = this.generateReferralCode(userId);
      await this.prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
      });
      return { referralCode: code };
    }

    return { referralCode: user.referralCode };
  }

  async getMyReferrals(userId: string) {
    return this.prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            email: true,
            mobile: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLeaderboard(limit: number = 10) {
    const referrals = await this.prisma.referral.groupBy({
      by: ['referrerId'],
      where: {
        status: 'COMPLETED',
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const userIds = referrals.map((r) => r.referrerId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        mobile: true,
      },
    });

    return referrals.map((ref) => ({
      user: users.find((u) => u.id === ref.referrerId),
      referralCount: ref._count.id,
    }));
  }

  async sendWhatsAppInvite(phoneNumber: string, referralCode: string, referrerName: string) {
    if (!this.whatsappApiKey || !this.whatsappApiUrl) {
      console.warn('WhatsApp API not configured');
      return { success: false, message: 'WhatsApp API not configured' };
    }

    const message = `Hi! ${referrerName} invited you to join LifeSet!\n\nUse referral code: ${referralCode}\n\nDownload the app and start your journey! 🚀`;

    try {
      const response = await axios.post(
        `${this.whatsappApiUrl}/send`,
        {
          to: phoneNumber,
          message: message,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.whatsappApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('WhatsApp API error:', error);
      return { success: false, error: error.message };
    }
  }

  private generateReferralCode(userId: string): string {
    // Generate a unique referral code
    const prefix = 'LS';
    const timestamp = Date.now().toString(36).toUpperCase();
    const userIdShort = userId.substring(0, 4).toUpperCase();
    return `${prefix}${timestamp}${userIdShort}`;
  }
}
