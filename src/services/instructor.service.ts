import prisma from '../prisma';
import { ApplyInstructorDto } from '../dtos/instructor/apply-instructor.dto';
import { ReviewApplicationDto } from '../dtos/instructor/review-application.dto';
import { JoinInstructorDto } from '../dtos/instructor/join-instructor.dto';
import { ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

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

    async publicJoinAsInstructor(dto: JoinInstructorDto) {
        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: dto.email }
        });

        if (existingUser) {
            throw { status: 409, message: 'User with this email already exists' };
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // 3. Get Student Role (Start as student, then apply)
        const studentRole = await prisma.role.findUnique({
            where: { name: 'student' }
        });

        if (!studentRole) {
            throw { status: 500, message: 'Student role not found' };
        }

        // 4. Create User + Application in Transaction
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    name: dto.name,
                    roleId: studentRole.id,
                    isActive: false // Explicitly set to false for pending teachers
                },
                include: { role: true }
            });

            const application = await tx.instructorApplication.create({
                data: {
                    userId: user.id,
                    bio: dto.bio,
                    expertise: dto.expertise,
                    experience: dto.experience
                }
            });

            // 5. Generate Token
            const payload = { email: user.email, sub: user.id };
            const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

            return {
                access_token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role.name
                },
                application: {
                    id: application.id,
                    status: application.status
                }
            };
        });
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
                data: {
                    roleId: teacherRole.id,
                    isActive: true // Activate account upon instructor approval
                },
            });
        }

        return {
            id: updatedApplication.id,
            status: updatedApplication.status,
            reviewedAt: updatedApplication.reviewedAt,
        };
    }
};
