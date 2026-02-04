import prisma from '../prisma';
import { CreateTeacherDto } from '../dtos/teachers/create-teacher.dto';
import { UpdateTeacherDto } from '../dtos/teachers/update-teacher.dto';

export const TeachersService = {
    async create(createTeacherDto: CreateTeacherDto) {
        const user = await prisma.user.findUnique({
            where: { id: createTeacherDto.userId },
            include: { role: true },
        });

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        if (user.role.name !== 'teacher') {
            throw { status: 409, message: 'User must have teacher role' };
        }

        const existingTeacher = await prisma.teacher.findUnique({
            where: { userId: createTeacherDto.userId },
        });

        if (existingTeacher) {
            throw { status: 409, message: 'Teacher profile already exists for this user' };
        }

        return prisma.teacher.create({
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
    },

    async findAll() {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { role: { name: 'teacher' } },
                    { instructorApplications: { some: {} } },
                ],
            },
            include: {
                role: true,
                teacher: {
                    include: {
                        _count: {
                            select: { courses: true }
                        }
                    }
                },
                instructorApplications: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

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
            totalCourses: user.teacher?._count?.courses || 0,
            applicationStatus: user.instructorApplications[0]?.status || (user.role.name === 'teacher' ? 'APPROVED' : null),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    },

    async findOne(id: string) {
        const teacher = await prisma.teacher.findUnique({
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
            throw { status: 404, message: 'Teacher not found' };
        }

        return teacher;
    },

    async update(id: string, updateTeacherDto: UpdateTeacherDto) {
        await TeachersService.findOne(id);

        return prisma.teacher.update({
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
    },

    async remove(id: string) {
        await TeachersService.findOne(id);

        await prisma.teacher.delete({
            where: { id },
        });

        return { message: 'Teacher deleted successfully' };
    }
};
