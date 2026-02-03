import prisma from '../prisma';
import { ApplicationStatus } from '@prisma/client';

export class AcademicService {

    // Categories
    static async listCategories(search?: string) {
        const where: any = {};
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        return prisma.academicCategory.findMany({
            where,
            include: { subjects: true } // Include subjects to show hierarchy
        });
    }

    static async createCategory(name: string) {
        return prisma.academicCategory.create({
            data: { name }
        });
    }

    static async updateCategory(id: string, name: string) {
        return prisma.academicCategory.update({
            where: { id },
            data: { name }
        });
    }

    static async deleteCategory(id: string) {
        return prisma.academicCategory.delete({
            where: { id }
        });
    }

    static async bulkDeleteCategories(ids: string[]) {
        return prisma.academicCategory.deleteMany({
            where: { id: { in: ids } }
        });
    }

    // Subjects
    static async listSubjects(search?: string, categoryId?: string) {
        const where: any = {};
        if (categoryId) where.categoryId = categoryId;
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        return prisma.subject.findMany({
            where,
            include: { category: true }
        });
    }

    static async createSubject(name: string, categoryId: string) {
        // Validate category exists
        const category = await prisma.academicCategory.findUnique({ where: { id: categoryId } });
        if (!category) throw new Error('Category not found');

        return prisma.subject.create({
            data: {
                name,
                categoryId
            }
        });
    }

    static async updateSubject(id: string, name: string) {
        return prisma.subject.update({
            where: { id },
            data: { name }
        });
    }

    static async deleteSubject(id: string) {
        return prisma.subject.delete({
            where: { id }
        });
    }

    static async bulkDeleteSubjects(ids: string[]) {
        return prisma.subject.deleteMany({
            where: { id: { in: ids } }
        });
    }

    // Academic Requests (Teacher -> Admin)
    static async requestAcademicItem(teacherUserId: string, data: { type: string, name: string, categoryId?: string }) {
        const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUserId } });
        if (!teacher) throw new Error('Teacher profile not found');

        return prisma.academicRequest.create({
            data: {
                type: data.type,
                name: data.name,
                categoryId: data.categoryId,
                teacherId: teacher.id,
                status: 'PENDING'
            }
        });
    }

    static async listRequests(status?: ApplicationStatus) {
        const where: any = {};
        if (status) where.status = status;

        return prisma.academicRequest.findMany({
            where,
            include: { teacher: { include: { user: { select: { name: true, email: true } } } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async resolveRequest(requestId: string, status: ApplicationStatus, reason?: string) {
        return prisma.$transaction(async (tx) => {
            const request = await tx.academicRequest.findUnique({ where: { id: requestId } });
            if (!request) throw new Error('Request not found');

            const updatedRequest = await tx.academicRequest.update({
                where: { id: requestId },
                data: {
                    status,
                    rejectionReason: reason,
                }
            });

            if (status === 'APPROVED') {
                if (request.type === 'CATEGORY') {
                    await tx.academicCategory.create({ data: { name: request.name } });
                } else if (request.type === 'SUBJECT' && request.categoryId) {
                    await tx.subject.create({
                        data: {
                            name: request.name,
                            categoryId: request.categoryId
                        }
                    });
                }
            }

            return updatedRequest;
        });
    }
}
