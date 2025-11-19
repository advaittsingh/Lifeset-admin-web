import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import Redis from 'ioredis';
import * as os from 'os';
import * as process from 'process';

@Injectable()
export class MonitoringService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  // ========== Server Metrics ==========
  async getServerMetrics() {
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Get system info
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Calculate CPU percentage (simplified)
    const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000 / uptime) * 100;

    // Get disk usage (simplified - would need actual disk stats in production)
    const diskUsage = {
      total: 0,
      used: 0,
      free: 0,
      percent: 0,
    };

    return {
      cpu: {
        usage: Math.min(cpuPercent, 100),
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percent: (usedMem / totalMem) * 100,
        process: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external,
          rss: memUsage.rss,
        },
      },
      disk: diskUsage,
      uptime: {
        seconds: uptime,
        formatted: this.formatUptime(uptime),
      },
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
    };
  }

  // ========== API Latency ==========
  async getApiLatency() {
    // This would typically come from request logging middleware
    // For now, return mock data structure
    try {
      const latencyData = await this.redisService.get('api:latency:stats');
      if (latencyData) {
        return JSON.parse(latencyData);
      }
    } catch (e) {
      // Ignore
    }

    return {
      average: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      requests: 0,
    };
  }

  // ========== Redis Stats ==========
  async getRedisStats() {
    try {
      if (!this.redisClient) {
        return {
          connected: false,
          error: 'Redis client not available - check Redis module configuration. REDIS_CLIENT was not injected.',
        };
      }

      // Check if Redis client is properly initialized
      if (typeof this.redisClient.ping !== 'function') {
        return {
          connected: false,
          error: 'Redis client is not properly initialized. Expected Redis instance but got different type.',
        };
      }

      // Check if Redis is connected
      const status = this.redisClient.status;
      
      // ioredis status can be: 'end', 'close', 'wait', 'connecting', 'connect', 'ready'
      if (status === 'end' || status === 'close') {
        return {
          connected: false,
          error: `Redis connection closed. Status: ${status}. Please check if Redis server is running on localhost:6379.`,
        };
      }

      if (status === 'wait' || status === 'connecting') {
        return {
          connected: false,
          error: `Redis is connecting... Status: ${status}. Please wait a moment and refresh.`,
        };
      }

      // Try to ping Redis to verify connection (with timeout)
      try {
        const pingPromise = this.redisClient.ping();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Ping timeout after 2 seconds')), 2000)
        );
        
        const pong = await Promise.race([pingPromise, timeoutPromise]) as string;
        if (pong !== 'PONG') {
          return {
            connected: false,
            error: `Redis ping failed - received: ${pong} instead of PONG. Connection may be unstable.`,
          };
        }
      } catch (pingError: any) {
        const pingErrorMsg = pingError?.message || pingError?.toString() || 'Unknown ping error';
        return {
          connected: false,
          error: `Redis ping failed: ${pingErrorMsg}. Check Redis server connection. Status: ${status}`,
          status: status,
        };
      }

      const info = await this.redisClient.info();
      const stats = {
        connected: true,
        memory: {
          used: 0,
          peak: 0,
        },
        keys: 0,
        hits: 0,
        misses: 0,
        hitRate: 0,
      };

      // Parse Redis INFO command output
      if (info) {
        const lines = info.split('\r\n');
        lines.forEach((line) => {
          if (line.startsWith('used_memory:')) {
            stats.memory.used = parseInt(line.split(':')[1]) || 0;
          }
          if (line.startsWith('used_memory_peak:')) {
            stats.memory.peak = parseInt(line.split(':')[1]) || 0;
          }
          if (line.startsWith('keyspace_hits:')) {
            stats.hits = parseInt(line.split(':')[1]) || 0;
          }
          if (line.startsWith('keyspace_misses:')) {
            stats.misses = parseInt(line.split(':')[1]) || 0;
          }
        });

        const total = stats.hits + stats.misses;
        stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
      }

      // Get key count
      try {
        const keys = await this.redisClient.keys('*');
        stats.keys = keys?.length || 0;
      } catch (e) {
        // Ignore key count errors
      }

      return stats;
    } catch (error: any) {
      // Provide more detailed error information
      let errorMessage = 'Unknown error';
      let errorCode = 'NO_CODE';
      let errorDetails = '';

      try {
        if (error === null || error === undefined) {
          errorMessage = 'Error object is null or undefined';
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.message) {
          errorMessage = String(error.message);
        } else if (error.toString && typeof error.toString === 'function') {
          errorMessage = error.toString();
        } else {
          try {
            errorMessage = JSON.stringify(error);
          } catch {
            errorMessage = 'Unable to stringify error object';
          }
        }

        if (error && error.code !== undefined) {
          errorCode = String(error.code);
        }

        if (error && error.stack) {
          errorDetails = String(error.stack);
        }
      } catch (parseError) {
        errorMessage = 'Error occurred while parsing error object';
        console.error('Error parsing error:', parseError);
      }

      // Log the full error for debugging
      console.error('Redis connection error:', {
        message: errorMessage,
        code: errorCode,
        status: this.redisClient?.status,
        errorType: error?.constructor?.name,
        error: error,
        details: errorDetails,
        hasRedisClient: !!this.redisClient,
        redisClientType: typeof this.redisClient,
      });
      
      const statusInfo = this.redisClient?.status ? ` Status: ${this.redisClient.status}.` : ' Status: unknown.';
      const codeInfo = errorCode !== 'NO_CODE' ? ` Code: ${errorCode}.` : '';
      
      return {
        connected: false,
        error: `${errorMessage}${codeInfo}${statusInfo} Please ensure Redis is running and accessible at the configured host/port.`,
        status: this.redisClient?.status || 'unknown',
      };
    }
  }

  // ========== DB Performance ==========
  async getDbPerformance() {
    const start = Date.now();
    try {
      // Simple query to test DB performance
      await this.prisma.user.count();
      const queryTime = Date.now() - start;

      // Get table sizes (simplified)
      let tableStats: any[] = [];
      try {
        tableStats = await this.prisma.$queryRaw`
          SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
            pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
          FROM pg_tables
          WHERE schemaname = 'public'
          ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
          LIMIT 10
        ` as any[];
      } catch (e) {
        // Ignore if query fails
      }

      return {
        queryTime,
        pool: {
          active: 0,
          idle: 0,
          total: 0,
        },
        tableSizes: tableStats || [],
        connections: {
          active: 0,
          idle: 0,
        },
      };
    } catch (error: any) {
      return {
        queryTime: Date.now() - start,
        error: error.message,
      };
    }
  }

  // ========== Queue Processing ==========
  async getQueueStats() {
    // This would come from BullMQ
    const queueStats = {
      active: 0,
      waiting: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      jobs: {
        email: { active: 0, waiting: 0, completed: 0, failed: 0 },
        sms: { active: 0, waiting: 0, completed: 0, failed: 0 },
        notification: { active: 0, waiting: 0, completed: 0, failed: 0 },
        analytics: { active: 0, waiting: 0, completed: 0, failed: 0 },
      },
    };

    return queueStats;
  }

  // ========== App Metrics ==========
  async getAppMetrics() {
    const [activeUsers, totalUsers, recentCrashes] = await Promise.all([
      this.prisma.session.count({
        where: {
          expiresAt: { gt: new Date() },
        },
      }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.userEvent.findMany({
        where: {
          eventType: 'ERROR',
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      crashes: recentCrashes.length,
      recentCrashes: recentCrashes.map((crash) => ({
        id: crash.id,
        userId: crash.userId,
        eventType: crash.eventType,
        metadata: crash.metadata,
        createdAt: crash.createdAt,
      })),
      activeUsers,
      totalUsers,
      featureUsage: await this.getFeatureUsage(),
      versionDistribution: await this.getVersionDistribution(),
    };
  }

  async getFeatureUsage() {
    // Get feature usage from analytics events
    const features = await this.prisma.userEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    return features.map((f) => ({
      feature: f.eventType,
      count: f._count.id,
    }));
  }

  async getVersionDistribution() {
    // This would come from app version tracking
    return [
      { version: '1.0.0', users: 0, percent: 0 },
    ];
  }

  // ========== Web Metrics ==========
  async getWebMetrics() {
    const [cmsActivity, adminLogs, trafficSummary] = await Promise.all([
      this.getCmsActivity(),
      this.getAdminLogs(),
      this.getTrafficSummary(),
    ]);

    return {
      cmsActivity,
      adminLogs,
      trafficSummary,
    };
  }

  async getCmsActivity() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [postsCreated, postsUpdated, usersCreated, jobsCreated] = await Promise.all([
      this.prisma.post.count({ where: { createdAt: { gte: last24h } } }),
      this.prisma.post.count({ where: { updatedAt: { gte: last24h } } }),
      this.prisma.user.count({ where: { createdAt: { gte: last24h } } }),
      this.prisma.jobPost.count({ where: { createdAt: { gte: last24h } } }),
    ]);

    return {
      postsCreated,
      postsUpdated,
      usersCreated,
      jobsCreated,
      last24h,
    };
  }

  async getAdminLogs() {
    // Get audit logs if available
    const logs = await this.prisma.userEvent.findMany({
      where: {
        eventType: { contains: 'ADMIN' },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return logs;
  }

  async getTrafficSummary() {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const traffic = await Promise.all(
      last7Days.map(async (date) => {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);

        const [sessions, users] = await Promise.all([
          this.prisma.session.count({
            where: {
              createdAt: { gte: start, lt: end },
            },
          }),
          this.prisma.user.count({
            where: {
              createdAt: { gte: start, lt: end },
            },
          }),
        ]);

        return {
          date,
          sessions,
          users,
        };
      }),
    );

    return {
      last7Days: traffic,
      total: {
        sessions: traffic.reduce((sum, t) => sum + t.sessions, 0),
        users: traffic.reduce((sum, t) => sum + t.users, 0),
      },
    };
  }

  // ========== User Behavior ==========
  async getUserBehaviorMetrics() {
    const [feedStats, scorecardTracking, contentPerformance, mcqAnalytics, referralAnalytics] = await Promise.all([
      this.getFeedStats(),
      this.getScorecardTracking(),
      this.getContentPerformance(),
      this.getMcqAnalytics(),
      this.getReferralAnalytics(),
    ]);

    return {
      feedStats,
      scorecardTracking,
      contentPerformance,
      mcqAnalytics,
      referralAnalytics,
    };
  }

  async getFeedStats() {
    const [totalFeeds, activeFeeds] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { isActive: true } }),
    ]);

    // Get interaction stats
    let interactions: any = { posts_with_interactions: 0, total_likes: 0, total_comments: 0 };
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT "postId") as posts_with_interactions,
          SUM(CASE WHEN type = 'LIKE' THEN 1 ELSE 0 END) as total_likes,
          SUM(CASE WHEN type = 'COMMENT' THEN 1 ELSE 0 END) as total_comments
        FROM "PostInteraction"
      ` as any[];
      if (result && result.length > 0) {
        interactions = result[0];
      }
    } catch (e) {
      // Ignore
    }

    return {
      totalFeeds,
      activeFeeds,
      interactions,
    };
  }

  async getScorecardTracking() {
    const [totalUsers, usersWithScore, avgScore] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.userScore.count(),
      this.prisma.userScore.aggregate({
        _avg: {
          totalScore: true,
        },
      }),
    ]);

    return {
      totalUsers,
      usersWithScore: usersWithScore,
      avgScore: avgScore._avg.totalScore || 0,
      distribution: await this.getScoreDistribution(),
    };
  }

  async getScoreDistribution() {
    // Simplified distribution
    return {
      '0-100': 0,
      '101-500': 0,
      '501-1000': 0,
      '1000+': 0,
    };
  }

  async getContentPerformance() {
    const topPosts = await this.prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return {
      topPosts: topPosts.map((post) => ({
        id: post.id,
        title: post.title,
        likes: post._count.likes,
        comments: post._count.comments,
        createdAt: post.createdAt,
      })),
    };
  }

  async getMcqAnalytics() {
    const [totalQuestions, totalAttempts, avgScore] = await Promise.all([
      this.prisma.mcqQuestion.count(),
      this.prisma.mcqAttempt.count(),
      this.prisma.mcqAttempt.aggregate({
        _avg: {
          score: true,
        },
      }),
    ]);

    return {
      totalQuestions,
      totalAttempts,
      avgScore: avgScore._avg.score || 0,
      categoryBreakdown: await this.getMcqCategoryBreakdown(),
    };
  }

  async getMcqCategoryBreakdown() {
    const breakdown = await this.prisma.mcqAttempt.groupBy({
      by: ['categoryId'],
      _count: {
        id: true,
      },
      _avg: {
        score: true,
      },
    });

    return breakdown;
  }

  async getReferralAnalytics() {
    const [totalReferrals, activeReferrers, totalRewards] = await Promise.all([
      this.prisma.referral.count(),
      this.prisma.referral.groupBy({
        by: ['referrerId'],
        _count: {
          id: true,
        },
      }),
      this.prisma.referral.aggregate({
        _sum: {
          rewardAmount: true,
        },
      }),
    ]);

    return {
      totalReferrals,
      activeReferrers: activeReferrers.length,
      totalRewards: totalRewards._sum.rewardAmount || 0,
    };
  }

  // ========== Engagement Metrics ==========
  async getEngagementMetrics() {
    const [notifications, adsPerformance, streakInsights] = await Promise.all([
      this.getNotificationMetrics(),
      this.getAdsPerformance(),
      this.getStreakInsights(),
    ]);

    return {
      notifications,
      adsPerformance,
      streakInsights,
    };
  }

  async getNotificationMetrics() {
    const [total, sent, read, unread] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      this.prisma.notification.count({ where: { isRead: true } }),
      this.prisma.notification.count({ where: { isRead: false } }),
    ]);

    return {
      total,
      sent24h: sent,
      read,
      unread,
      readRate: total > 0 ? (read / total) * 100 : 0,
    };
  }

  async getAdsPerformance() {
    const [totalImpressions, totalClicks, revenue] = await Promise.all([
      this.prisma.adImpression.count(),
      this.prisma.adImpression.count({ where: { clicked: true } }),
      this.prisma.adImpression.aggregate({
        _sum: {
          revenue: true,
        },
      }),
    ]);

    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      revenue: revenue._sum.revenue || 0,
    };
  }

  async getStreakInsights() {
    // This would track user daily activity streaks
    return {
      activeStreaks: 0,
      avgStreakLength: 0,
      longestStreak: 0,
    };
  }

  // ========== Cache Management ==========
  async clearCache(pattern?: string) {
    try {
      if (!this.redisClient) {
        throw new Error('Redis client not available');
      }

      // Check if Redis is connected
      const status = this.redisClient.status;
      if (status !== 'ready' && status !== 'connect') {
        throw new Error(`Redis is not connected. Status: ${status}`);
      }

      if (pattern && pattern.trim()) {
        // Clear keys matching pattern
        const keys = await this.redisClient.keys(pattern.trim());
        if (keys && keys.length > 0) {
          // Delete keys in batches to avoid issues with large key sets
          if (keys.length <= 1000) {
            await this.redisClient.del(...keys);
          } else {
            // For large key sets, delete in batches
            for (let i = 0; i < keys.length; i += 1000) {
              const batch = keys.slice(i, i + 1000);
              await this.redisClient.del(...batch);
            }
          }
          return { 
            cleared: keys.length, 
            pattern: pattern.trim(),
            message: `Cleared ${keys.length} keys matching pattern "${pattern.trim()}"`
          };
        } else {
          return { 
            cleared: 0, 
            pattern: pattern.trim(),
            message: `No keys found matching pattern "${pattern.trim()}"`
          };
        }
      } else {
        // Clear all cache
        await this.redisClient.flushdb();
        return { 
          cleared: 'all', 
          pattern: '*',
          message: 'All cache cleared successfully'
        };
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Clear cache error:', error);
      throw new Error(`Failed to clear cache: ${errorMessage}`);
    }
  }

  async getCacheStats() {
    try {
      if (!this.redisClient) {
        return {
          totalKeys: 0,
          error: 'Redis client not available',
        };
      }

      const keys = await this.redisClient.keys('*');
      const stats = {
        totalKeys: keys?.length || 0,
        memory: await this.getRedisStats(),
      };
      return stats;
    } catch (error: any) {
      return {
        totalKeys: 0,
        error: error.message,
      };
    }
  }

  // Helper
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }
}
