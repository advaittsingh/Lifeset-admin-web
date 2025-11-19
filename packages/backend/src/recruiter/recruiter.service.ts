import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class RecruiterService {
  constructor(private prisma: PrismaService) {}

  // ========== Dashboard Stats ==========
  async getDashboardStats(companyId: string) {
    const [totalJobs, activeJobs, totalApplications, pendingApplications, shortlisted, rejected] = await Promise.all([
      this.prisma.jobPost.count({ where: { companyId } }),
      this.prisma.jobPost.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.jobApplication.count({
        where: { jobPost: { companyId } },
      }),
      this.prisma.jobApplication.count({
        where: { jobPost: { companyId }, status: 'PENDING' },
      }),
      this.prisma.jobApplication.count({
        where: { jobPost: { companyId }, status: 'SHORTLISTED' },
      }),
      this.prisma.jobApplication.count({
        where: { jobPost: { companyId }, status: 'REJECTED' },
      }),
    ]);

    const recentApplications = await this.prisma.jobApplication.findMany({
      where: { jobPost: { companyId } },
      include: {
        user: {
          include: { studentProfile: true },
        },
        jobPost: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        shortlisted,
        rejected,
        interviewScheduled: 0, // Can be added later
      },
      recentApplications,
    };
  }

  // ========== Job Reports ==========
  async getJobReports(companyId: string, filters?: any) {
    const where: any = { companyId };
    if (filters?.startDate) {
      where.createdAt = { gte: new Date(filters.startDate) };
    }
    if (filters?.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.endDate),
      };
    }

    const jobs = await this.prisma.jobPost.findMany({
      where,
      include: {
        _count: {
          select: {
            jobApplications: true,
          },
        },
        jobApplications: {
          include: {
            user: {
              include: { studentProfile: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((job) => ({
      ...job,
      applicationStats: {
        total: job._count.jobApplications,
        pending: job.jobApplications.filter((a) => a.status === 'PENDING').length,
        shortlisted: job.jobApplications.filter((a) => a.status === 'SHORTLISTED').length,
        rejected: job.jobApplications.filter((a) => a.status === 'REJECTED').length,
      },
    }));
  }

  // ========== Application Reports ==========
  async getApplicationReports(companyId: string, filters?: any) {
    const where: any = { jobPost: { companyId } };
    if (filters?.status) where.status = filters.status;
    if (filters?.jobId) where.jobPostId = filters.jobId;
    if (filters?.startDate) {
      where.createdAt = { gte: new Date(filters.startDate) };
    }
    if (filters?.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.endDate),
      };
    }

    const applications = await this.prisma.jobApplication.findMany({
      where,
      include: {
        user: {
          include: { studentProfile: true },
        },
        jobPost: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: applications,
      summary: {
        total: applications.length,
        byStatus: {
          PENDING: applications.filter((a) => a.status === 'PENDING').length,
          SHORTLISTED: applications.filter((a) => a.status === 'SHORTLISTED').length,
          REJECTED: applications.filter((a) => a.status === 'REJECTED').length,
          ACCEPTED: applications.filter((a) => a.status === 'ACCEPTED').length,
        },
      },
    };
  }

  // ========== Candidate Analytics ==========
  async getCandidateAnalytics(companyId: string) {
    const applications = await this.prisma.jobApplication.findMany({
      where: { jobPost: { companyId } },
      include: {
        user: {
          include: { studentProfile: true },
        },
      },
    });

    // Group by skills
    const skillCounts: Record<string, number> = {};
    applications.forEach((app) => {
      const skills = app.user.studentProfile?.technicalSkills || [];
      if (Array.isArray(skills)) {
        skills.forEach((skill: string) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    // Group by location
    const locationCounts: Record<string, number> = {};
    applications.forEach((app) => {
      const city = app.user.studentProfile?.city || 'Unknown';
      locationCounts[city] = (locationCounts[city] || 0) + 1;
    });

    // Group by experience level
    const experienceCounts = {
      fresher: applications.filter((a) => !a.user.studentProfile?.graduation).length,
      experienced: applications.filter((a) => a.user.studentProfile?.graduation).length,
    };

    return {
      skillDistribution: Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      locationDistribution: Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count),
      experienceDistribution: experienceCounts,
    };
  }

  // ========== Job Performance ==========
  async getJobPerformance(companyId: string, jobId?: string) {
    const where: any = { companyId };
    if (jobId) where.id = jobId;

    const jobs = await this.prisma.jobPost.findMany({
      where,
      include: {
        _count: {
          select: {
            jobApplications: true,
            views: true,
          },
        },
        jobApplications: {
          include: {
            user: { include: { studentProfile: true } },
          },
        },
      },
    });

    return jobs.map((job) => ({
      id: job.id,
      title: job.jobTitle,
      views: job._count.views || 0,
      applications: job._count.jobApplications,
      applicationRate: job._count.views > 0 ? ((job._count.jobApplications / job._count.views) * 100).toFixed(2) : 0,
      shortlistRate: job._count.jobApplications > 0
        ? ((job.jobApplications.filter((a) => a.status === 'SHORTLISTED').length / job._count.jobApplications) * 100).toFixed(2)
        : 0,
    }));
  }
}

