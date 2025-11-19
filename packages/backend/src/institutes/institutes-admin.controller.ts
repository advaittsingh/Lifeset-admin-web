import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InstitutesAdminService } from './institutes-admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserType } from '@lifeset/shared';

@ApiTags('Institutes Admin')
@Controller('admin/institutes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserType.ADMIN)
export class InstitutesAdminController {
  constructor(private readonly institutesAdminService: InstitutesAdminService) {}

  // ========== Course Master Data ==========
  @Get('course-master')
  @ApiOperation({ summary: 'Get course master data (Admin)' })
  async getCourseMasterData() {
    return this.institutesAdminService.getCourseMasterData();
  }

  @Post('course-master/categories')
  @ApiOperation({ summary: 'Create course category (Admin)' })
  async createCourseCategory(@Body() data: any) {
    return this.institutesAdminService.createCourseCategory(data);
  }

  @Put('course-master/categories/:id')
  @ApiOperation({ summary: 'Update course category (Admin)' })
  async updateCourseCategory(@Param('id') id: string, @Body() data: any) {
    return this.institutesAdminService.updateCourseCategory(id, data);
  }

  @Delete('course-master/categories/:id')
  @ApiOperation({ summary: 'Delete course category (Admin)' })
  async deleteCourseCategory(@Param('id') id: string) {
    return this.institutesAdminService.deleteCourseCategory(id);
  }

  // ========== Institute Management ==========
  @Post()
  @ApiOperation({ summary: 'Create institute (Admin)' })
  async createInstitute(@Body() data: any) {
    return this.institutesAdminService.createInstitute(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update institute (Admin)' })
  async updateInstitute(@Param('id') id: string, @Body() data: any) {
    return this.institutesAdminService.updateInstitute(id, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get institute by ID (Admin)' })
  async getInstituteById(@Param('id') id: string) {
    return this.institutesAdminService.getInstituteById(id);
  }

  @Get(':id/landing')
  @ApiOperation({ summary: 'Get institute landing page data (Admin)' })
  async getInstituteLandingPage(@Param('id') id: string) {
    return this.institutesAdminService.getInstituteLandingPage(id);
  }

  // ========== Course Management ==========
  @Post(':id/courses')
  @ApiOperation({ summary: 'Create course for institute (Admin)' })
  async createCourse(@Param('id') instituteId: string, @Body() data: any) {
    return this.institutesAdminService.createCourse({
      ...data,
      collegeId: instituteId,
    });
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Get courses by institute (Admin)' })
  async getCoursesByInstitute(@Param('id') id: string) {
    return this.institutesAdminService.getCoursesByInstitute(id);
  }

  @Put('courses/:id')
  @ApiOperation({ summary: 'Update course (Admin)' })
  async updateCourse(@Param('id') id: string, @Body() data: any) {
    return this.institutesAdminService.updateCourse(id, data);
  }

  // ========== Student Dashboard & Reports ==========
  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get institute student dashboard (Admin)' })
  async getInstituteStudentDashboard(@Param('id') id: string) {
    return this.institutesAdminService.getInstituteStudentDashboard(id);
  }

  @Get(':id/reports')
  @ApiOperation({ summary: 'Get institute student reports (Admin)' })
  async getInstituteReports(@Param('id') id: string, @Query() filters: any) {
    return this.institutesAdminService.getInstituteReports(id, filters);
  }

  // ========== Institute Search ==========
  @Get('search/institutes')
  @ApiOperation({ summary: 'Search institutes (Admin)' })
  async searchInstitutes(@Query() filters: any) {
    return this.institutesAdminService.searchInstitutes(filters);
  }
}

