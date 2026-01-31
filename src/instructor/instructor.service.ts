import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyInstructorDto } from './dto/apply-instructor.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class InstructorService {
    constructor(private prisma: PrismaService) { }

    async applyForInstructor(userId: string, applyDto: ApplyInstructorDto) {
        // Check if user exists and is a student
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role.name !== 'student') {
            throw new BadRequestException('Only students can apply to become instructors');
        }

        // Check if user already has a pending or approved application
        const existingApplication = await this.prisma.instructorApplication.findFirst({
            where: {
                userId,
                status: {
                    in: [ApplicationStatus.PENDING, ApplicationStatus.APPROVED],
                },
            },
        });

        if (existingApplication) {
            throw new BadRequestException('You already have a pending or approved application');
        }

        // Create application
        const application = await this.prisma.instructorApplication.create({
            data: {
                userId,
                bio: applyDto.bio,
                expertise: applyDto.expertise,
                experience: applyDto.experience,
            },
        });

        return {
            id: application.id,
            status: application.status,
            createdAt: application.createdAt,
        };
    }

    async getApplications(status?: ApplicationStatus) {
        const where = status ? { status } : {};

        const applications = await this.prisma.instructorApplication.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return { applications };
    }

    async reviewApplication(applicationId: string, reviewDto: ReviewApplicationDto, reviewerId: string) {
        const application = await this.prisma.instructorApplication.findUnique({
            where: { id: applicationId },
            include: { user: { include: { role: true } } },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        if (application.status !== ApplicationStatus.PENDING) {
            throw new BadRequestException('Application has already been reviewed');
        }

        // Update application
        const updatedApplication = await this.prisma.instructorApplication.update({
            where: { id: applicationId },
            data: {
                status: reviewDto.status,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
                rejectionReason: reviewDto.rejectionReason,
            },
        });

        // If approved, update user role to teacher
        if (reviewDto.status === ApplicationStatus.APPROVED) {
            const teacherRole = await this.prisma.role.findUnique({
                where: { name: 'teacher' },
            });

            if (!teacherRole) {
                throw new Error('Teacher role not found in database');
            }

            await this.prisma.user.update({
                where: { id: application.userId },
                data: { roleId: teacherRole.id },
            });
        }

        return {
            id: updatedApplication.id,
            status: updatedApplication.status,
            reviewedAt: updatedApplication.reviewedAt,
        };
    }
}
