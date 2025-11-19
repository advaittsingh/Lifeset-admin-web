import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserType, NotificationType } from '@lifeset/shared';
import { PrismaService } from '../common/prisma/prisma.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserType.ADMIN)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  // Users Management
  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin)' })
  async getUsers(@Query() filters: any) {
    const where: any = {};
    
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { mobile: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    if (filters.userType) {
      where.userType = filters.userType;
    }

    const limit = filters.limit ? parseInt(filters.limit.toString()) : 100;
    const page = filters.page ? parseInt(filters.page.toString()) : 1;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          studentProfile: true,
          companyProfile: true,
          collegeProfile: true,
          adminProfile: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Patch('users/:id/activate')
  @ApiOperation({ summary: 'Activate user' })
  async activateUser(@Param('id') id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivateUser(@Param('id') id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Posts Management
  @Get('posts')
  @ApiOperation({ summary: 'Get all posts (Admin)' })
  async getPosts(@Query() filters: any) {
    const where: any = {};
    
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    if (filters.postType) {
      where.postType = filters.postType;
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true';
    }

    const limit = filters.limit ? parseInt(filters.limit.toString()) : 100;
    const page = filters.page ? parseInt(filters.page.toString()) : 1;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              mobile: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Patch('posts/:id')
  @ApiOperation({ summary: 'Update post' })
  async updatePost(@Param('id') id: string, @Body() data: any) {
    return this.prisma.post.update({
      where: { id },
      data,
    });
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete post' })
  async deletePost(@Param('id') id: string) {
    return this.prisma.post.delete({
      where: { id },
    });
  }

  // Analytics
  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get analytics overview' })
  async getAnalyticsOverview() {
    const [totalUsers, activeUsers, totalPosts, totalJobs] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.post.count(),
      this.prisma.jobPost.count(),
    ]);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const newUsers = await this.prisma.user.count({
      where: { createdAt: { gte: monthAgo } },
    });

    return {
      totalUsers,
      activeUsers,
      newUsers,
      totalPosts,
      totalJobs,
      totalApplications: await this.prisma.jobApplication.count(),
      engagementRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
      retentionRate: 78.5, // This would be calculated from actual data
    };
  }

  @Get('analytics/user-growth')
  @ApiOperation({ summary: 'Get user growth data' })
  async getUserGrowth(@Query('period') period: 'day' | 'week' | 'month' = 'month') {
    const now = new Date();
    const data: any[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now);
      const end = new Date(now);
      
      if (period === 'month') {
        start.setMonth(start.getMonth() - i - 1);
        end.setMonth(end.getMonth() - i);
      } else if (period === 'week') {
        start.setDate(start.getDate() - (i + 1) * 7);
        end.setDate(end.getDate() - i * 7);
      } else {
        start.setDate(start.getDate() - i - 1);
        end.setDate(end.getDate() - i);
      }

      const [users, active] = await Promise.all([
        this.prisma.user.count({
          where: { createdAt: { lt: end } },
        }),
        this.prisma.user.count({
          where: {
            createdAt: { lt: end },
            isActive: true,
          },
        }),
      ]);

      data.push({
        period: period === 'month' ? end.toLocaleDateString('en-US', { month: 'short' }) :
                period === 'week' ? `Week ${6 - i}` :
                end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        users,
        active,
      });
    }

    return data;
  }

  // Jobs Management
  @Get('jobs')
  @ApiOperation({ summary: 'Get all jobs (Admin)' })
  async getJobs(@Query() filters: any) {
    const where: any = {};
    
    if (filters.search) {
      where.OR = [
        { jobTitle: { contains: filters.search, mode: 'insensitive' } },
        { jobDescription: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      this.prisma.jobPost.findMany({
        where,
        include: {
          post: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  mobile: true,
                },
              },
            },
          },
          company: {
            select: {
              companyName: true,
            },
          },
          _count: {
            select: {
              jobApplications: true,
            },
          },
        },
        skip: filters.page ? (filters.page - 1) * (filters.limit || 10) : 0,
        take: filters.limit ? parseInt(filters.limit) : 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.jobPost.count({ where }),
    ]);

    return {
      data: jobs,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total,
        totalPages: Math.ceil(total / (filters.limit || 10)),
      },
    };
  }

  // Notifications
  @Post('notifications')
  @ApiOperation({ summary: 'Send notification (Admin)' })
  async sendNotification(@Body() data: { 
    userId?: string; 
    title: string; 
    message: string; 
    type: string; 
    sendToAll?: boolean;
    filters?: {
      userType?: string;
      collegeId?: string;
      collegeProfileId?: string;
      courseId?: string;
      city?: string;
      state?: string;
      isActive?: boolean;
      isVerified?: boolean;
      registrationDateFrom?: string;
      registrationDateTo?: string;
    };
  }) {
    const where: any = {};

    if (data.sendToAll) {
      // Apply filters if provided
      if (data.filters) {
        if (data.filters.userType) {
          where.userType = data.filters.userType;
        }
        if (data.filters.isActive !== undefined) {
          where.isActive = data.filters.isActive;
        }
        if (data.filters.isVerified !== undefined) {
          where.isVerified = data.filters.isVerified;
        }
        if (data.filters.registrationDateFrom || data.filters.registrationDateTo) {
          where.createdAt = {};
          if (data.filters.registrationDateFrom) {
            where.createdAt.gte = new Date(data.filters.registrationDateFrom);
          }
          if (data.filters.registrationDateTo) {
            where.createdAt.lte = new Date(data.filters.registrationDateTo);
          }
        }

        // Filter by student profile fields
        if (data.filters.collegeId || data.filters.collegeProfileId || data.filters.courseId || data.filters.city || data.filters.state) {
          where.studentProfile = {};
          if (data.filters.collegeId) {
            where.studentProfile.collegeId = data.filters.collegeId;
          }
          if (data.filters.collegeProfileId) {
            where.studentProfile.collegeProfileId = data.filters.collegeProfileId;
          }
          if (data.filters.courseId) {
            where.studentProfile.courseId = data.filters.courseId;
          }
          if (data.filters.city) {
            where.studentProfile.city = { contains: data.filters.city, mode: 'insensitive' };
          }
          if (data.filters.state) {
            where.studentProfile.state = { contains: data.filters.state, mode: 'insensitive' };
          }
        }
      } else {
        // Default: only active users
        where.isActive = true;
      }

      const users = await this.prisma.user.findMany({ 
        where,
        include: {
          studentProfile: true,
        },
      });

      const notifications = users.map(user => ({
        userId: user.id,
        title: data.title,
        message: data.message,
        type: data.type as NotificationType,
      }));
      
      return this.prisma.notification.createMany({
        data: notifications,
      });
    } else if (data.userId) {
      return this.prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type as NotificationType,
        },
      });
    }
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get all notifications (Admin)' })
  async getAllNotifications(@Query() filters: any) {
    const where: any = {};
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead === 'true';
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              mobile: true,
            },
          },
        },
        skip: filters.page ? (filters.page - 1) * (filters.limit || 10) : 0,
        take: filters.limit ? parseInt(filters.limit) : 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total,
        totalPages: Math.ceil(total / (filters.limit || 10)),
      },
    };
  }

  // Settings
  @Get('settings')
  @ApiOperation({ summary: 'Get platform settings' })
  async getSettings() {
    // In a real app, this would be stored in a settings table
    // For now, return default settings
    return {
      security: {
        sessionTimeout: 60,
        passwordPolicy: {
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          minLength: 8,
        },
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      system: {
        platformName: 'LifeSet Platform',
        maintenanceMode: false,
      },
    };
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update platform settings' })
  async updateSettings(@Body() data: any) {
    // In a real app, this would save to a settings table
    // For now, just return the updated settings
    return {
      ...data,
      updatedAt: new Date(),
    };
  }
}

