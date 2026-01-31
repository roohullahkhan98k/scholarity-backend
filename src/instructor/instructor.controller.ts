import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { ApplyInstructorDto } from './dto/apply-instructor.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApplicationStatus } from '@prisma/client';

@Controller('instructor')
export class InstructorController {
    constructor(private instructorService: InstructorService) { }

    @UseGuards(JwtAuthGuard)
    @Post('apply')
    async apply(@Request() req, @Body(ValidationPipe) applyDto: ApplyInstructorDto) {
        return this.instructorService.applyForInstructor(req.user.id, applyDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('applications')
    async getApplications(@Query('status') status?: ApplicationStatus) {
        return this.instructorService.getApplications(status);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('applications/:id')
    async reviewApplication(
        @Param('id') id: string,
        @Body(ValidationPipe) reviewDto: ReviewApplicationDto,
        @Request() req,
    ) {
        return this.instructorService.reviewApplication(id, reviewDto, req.user.id);
    }
}
