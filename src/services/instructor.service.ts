import prisma from '../prisma';
import { ApplyInstructorDto } from '../dtos/instructor/apply-instructor.dto';
import { ReviewApplicationDto } from '../dtos/instructor/review-application.dto';
import { ApplicationStatus } from '@prisma/client';

export const InstructorService = {
    async applyForInstructor(userId: string, applyDto: ApplyInstructorDto) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        if (user.role.name !== 'student') {
            throw { status: 400, message: 'Only students can apply to become instructors' };
        }

        const existingApplication = await prisma.instructorApplication.findFirst({
            where: {
                userId,
                status: {
                    in: [ApplicationStatus.PENDING, ApplicationStatus.APPROVED],
                },
            },
        });

        if (existingApplication) {
            throw { status: 400, message: 'You already have a pending or approved application' };
        }

        const application = await prisma.instructorApplication.create({
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
    },

    async getApplications(status?: ApplicationStatus) {
        const where = status ? { status } : {};

        const applications = await prisma.instructorApplication.findMany({
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
    },

    async reviewApplication(applicationId: string, reviewDto: ReviewApplicationDto, reviewerId: string) {
        const application = await prisma.instructorApplication.findUnique({
            where: { id: applicationId },
            include: { user: { include: { role: true } } },
        });

        if (!application) {
            throw { status: 404, message: 'Application not found' };
        }

        if (application.status !== ApplicationStatus.PENDING) {
            throw { status: 400, message: 'Application has already been reviewed' };
        }

        const updatedApplication = await prisma.instructorApplication.update({
            where: { id: applicationId },
            data: {
                status: reviewDto.status,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
                rejectionReason: reviewDto.rejectionReason,
            },
        });

        if (reviewDto.status === ApplicationStatus.APPROVED) {
            const teacherRole = await prisma.role.findUnique({
                where: { name: 'teacher' },
            });

            if (!teacherRole) {
                throw { status: 500, message: 'Teacher role not found in database' };
            }

            await prisma.user.update({
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
};
