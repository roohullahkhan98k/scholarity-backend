import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) { }

    async create(createStudentDto: CreateStudentDto) {
        // Check if user exists and has student role
        const user = await this.prisma.user.findUnique({
            where: { id: createStudentDto.userId },
            include: { role: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role.name !== 'student') {
            throw new ConflictException('User must have student role');
        }

        // Check if student profile already exists
        const existingStudent = await this.prisma.student.findUnique({
            where: { userId: createStudentDto.userId },
        });

        if (existingStudent) {
            throw new ConflictException('Student profile already exists for this user');
        }

        // Create student profile
        return this.prisma.student.create({
            data: {
                userId: createStudentDto.userId,
                bio: createStudentDto.bio,
                interests: createStudentDto.interests,
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
        // Get all users who are students AND don't have instructor applications
        const users = await this.prisma.user.findMany({
            where: {
                role: { name: 'student' },
                instructorApplications: { none: {} },
            },
            include: {
                role: true,
                student: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform to consistent format
        return users.map(user => ({
            id: user.student?.id || user.id,
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name,
            isActive: user.isActive,
            bio: user.student?.bio,
            interests: user.student?.interests,
            enrolledCourses: user.student?.enrolledCourses || 0,
            completedCourses: user.student?.completedCourses || 0,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }

    async findOne(id: string) {
        const student = await this.prisma.student.findUnique({
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

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        return student;
    }

    async update(id: string, updateStudentDto: UpdateStudentDto) {
        await this.findOne(id); // Check if exists

        return this.prisma.student.update({
            where: { id },
            data: updateStudentDto,
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

        await this.prisma.student.delete({
            where: { id },
        });

        return { message: 'Student deleted successfully' };
    }
}
