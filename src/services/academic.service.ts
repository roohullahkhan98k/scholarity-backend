import prisma from '../prisma';

export class AcademicService {

    // Categories
    static async listCategories() {
        return prisma.academicCategory.findMany({
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

    // Subjects
    static async listSubjects(categoryId?: string) {
        if (categoryId) {
            return prisma.subject.findMany({
                where: { categoryId },
                include: { category: true }
            });
        }
        return prisma.subject.findMany({
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
}
