import prisma from '../prisma';
import { CreateStudentDto } from '../dtos/students/create-student.dto';
import { UpdateStudentDto } from '../dtos/students/update-student.dto';

export const StudentsService = {
    async create(createStudentDto: CreateStudentDto) {
        const user = await prisma.user.findUnique({
            where: { id: createStudentDto.userId },
            include: { role: true },
        });

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        if (user.role.name !== 'student') {
            throw { status: 409, message: 'User must have student role' };
        }

        const existingStudent = await prisma.student.findUnique({
            where: { userId: createStudentDto.userId },
        });

        if (existingStudent) {
            throw { status: 409, message: 'Student profile already exists for this user' };
        }

        return prisma.student.create({
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
    },

    async findAll() {
        const users = await prisma.user.findMany({
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
    },

    async findOne(id: string) {
        const student = await prisma.student.findUnique({
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
            throw { status: 404, message: 'Student not found' };
        }

        return student;
    },

    async update(id: string, updateStudentDto: UpdateStudentDto) {
        await StudentsService.findOne(id);

        return prisma.student.update({
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
    },

    async remove(id: string) {
        await StudentsService.findOne(id);

        await prisma.student.delete({
            where: { id },
        });

        return { message: 'Student deleted successfully' };
    }
};
