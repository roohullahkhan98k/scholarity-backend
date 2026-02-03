import prisma from '../prisma';

export class TeacherService {

    // Get Teacher Profile
    static async getProfile(userId: string) {
        return prisma.teacher.findUnique({
            where: { userId },
            include: { user: true }
        });
    }

    // Update Teacher Profile
    static async updateProfile(userId: string, data: { bio?: string; experience?: string; expertise?: string }) {
        // Upsert ensures record exists even if it's the first time they edit profile
        return prisma.teacher.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data
            }
        });
    }

    // Get Verification Status (via InstructorApplication)
    static async getVerificationStatus(userId: string) {
        const application = await prisma.instructorApplication.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return {
            status: application ? application.status : 'NOT_APPLIED',
            reason: application ? application.rejectionReason : null
        };
    }
}
