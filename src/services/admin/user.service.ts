import prisma from '../../prisma';
import { User, Role } from '@prisma/client';

export class AdminUserService {

    // Get all users with pagination and filtering
    static async getAllUsers(page: number, limit: number, search?: string, roleId?: string) {
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (roleId) {
            where.roleId = roleId;
        }

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: { role: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Toggle User Status (Activate/Deactivate)
    static async toggleUserStatus(userId: string, isActive: boolean) {
        return prisma.user.update({
            where: { id: userId },
            data: { isActive },
            select: { id: true, name: true, isActive: true }
        });
    }

    // Change User Role
    static async changeUserRole(userId: string, roleName: string) {
        const role = await prisma.role.findUnique({ where: { name: roleName } });
        if (!role) throw new Error('Role not found');

        return prisma.user.update({
            where: { id: userId },
            data: { roleId: role.id },
            include: { role: true }
        });
    }

    // Approve Teacher Application
    static async approveTeacher(applicationId: string) {
        // 1. Find the application
        const application = await prisma.instructorApplication.findUnique({
            where: { id: applicationId },
            include: { user: true }
        });

        if (!application) throw new Error('Application not found');
        if (application.status === 'APPROVED') throw new Error('Application already approved');

        // 2. Update Application Status, Create Teacher Profile, Update User Role
        return prisma.$transaction(async (tx) => {
            // Update Application
            const updatedApp = await tx.instructorApplication.update({
                where: { id: applicationId },
                data: {
                    status: 'APPROVED',
                    reviewedAt: new Date()
                }
            });

            // Find TEACHER role
            const teacherRole = await tx.role.findUnique({ where: { name: 'TEACHER' } });
            if (!teacherRole) throw new Error('Teacher role not found');

            // Update User Role
            await tx.user.update({
                where: { id: application.userId },
                data: { roleId: teacherRole.id }
            });

            // Create Teacher Profile if not exists
            await tx.teacher.upsert({
                where: { userId: application.userId },
                update: {},
                create: {
                    userId: application.userId,
                    bio: application.bio,
                    expertise: application.expertise,
                    experience: application.experience
                }
            });

            return updatedApp;
        });
    }
}
