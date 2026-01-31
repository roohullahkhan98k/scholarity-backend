import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
    constructor(private prisma: PrismaService) { }

    async create(createTeacherDto: CreateTeacherDto) {
        // Check if user exists and has teacher role
        const user = await this.prisma.user.findUnique({
            where: { id: createTeacherDto.userId },
            include: { role: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role.name !== 'teacher') {
            throw new ConflictException('User must have teacher role');
        }

        // Check if teacher profile already exists
        const existingTeacher = await this.prisma.teacher.findUnique({
            where: { userId: createTeacherDto.userId },
        });

        if (existingTeacher) {
            throw new ConflictException('Teacher profile already exists for this user');
        }

        // Create teacher profile
        return this.prisma.teacher.create({
            data: {
                userId: createTeacherDto.userId,
                bio: createTeacherDto.bio,
                expertise: createTeacherDto.expertise,
                experience: createTeacherDto.experience,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }

    async findAll() {
        // Get all users who are teachers OR have instructor applications
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { role: { name: 'teacher' } },
                    { instructorApplications: { some: {} } },
                ],
            },
            include: {
                role: true,
                teacher: true,
                instructorApplications: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform to consistent format
        return users.map(user => ({
            id: user.teacher?.id || user.id,
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name,
            isActive: user.isActive,
            bio: user.teacher?.bio || user.instructorApplications[0]?.bio,
            expertise: user.teacher?.expertise || user.instructorApplications[0]?.expertise,
            experience: user.teacher?.experience || user.instructorApplications[0]?.experience,
            rating: user.teacher?.rating || 0,
            totalStudents: user.teacher?.totalStudents || 0,
            applicationStatus: user.instructorApplications[0]?.status || (user.role.name === 'teacher' ? 'APPROVED' : null),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }

    async findOne(id: string) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isActive: true,
                        role: true,
                    },
                },
            },
        });

        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        return teacher;
    }

    async update(id: string, updateTeacherDto: UpdateTeacherDto) {
        await this.findOne(id); // Check if exists

        return this.prisma.teacher.update({
            where: { id },
            data: updateTeacherDto,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Check if exists

        await this.prisma.teacher.delete({
            where: { id },
        });

        return { message: 'Teacher deleted successfully' };
    }
}
