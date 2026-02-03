import prisma from '../src/prisma';
import { AcademicService } from '../src/services/academic.service';

async function verifyAcademicFlow() {
    console.log('🧪 Starting Academic Flow Verification...');

    try {
        // 1. Get Teacher User
        const teacherUser = await prisma.user.findUnique({
            where: { email: 'teacher@scholarity.com' }
        });
        if (!teacherUser) throw new Error('Teacher not found');

        // 2. Teacher requests a new category "Graphic Design"
        console.log('📝 Teacher requesting "Graphic Design" category...');
        const request = await AcademicService.requestAcademicItem(teacherUser.id, {
            type: 'CATEGORY',
            name: 'Graphic Design'
        });
        console.log('✅ Request created with ID:', request.id);

        // 3. Admin lists pending requests
        console.log('📋 Admin listing pending requests...');
        const pending = await AcademicService.listRequests('PENDING');
        console.log(`Found ${pending.length} pending requests.`);

        // 4. Admin approves the request
        console.log('🚀 Admin approving request...');
        await AcademicService.resolveRequest(request.id, 'APPROVED');
        console.log('✅ Request approved.');

        // 5. Verify category exists
        const category = await prisma.academicCategory.findUnique({
            where: { name: 'Graphic Design' }
        });

        if (category) {
            console.log('🏁 SUCCESS: "Graphic Design" category created automatically!');
        } else {
            console.log('❌ FAILURE: Category not found.');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyAcademicFlow();
