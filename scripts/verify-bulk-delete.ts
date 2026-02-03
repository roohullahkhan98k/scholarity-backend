import prisma from '../src/prisma';
import { AcademicService } from '../src/services/academic.service';

async function verifyBulkDelete() {
    console.log('🧪 Starting Bulk Delete Verification...');

    try {
        // 1. Create dummy categories
        const cat1 = await AcademicService.createCategory('Bulk Test Cat 1');
        const cat2 = await AcademicService.createCategory('Bulk Test Cat 2');
        console.log(`✅ Created categories: ${cat1.name}, ${cat2.name}`);

        // 2. Bulk Delete Categories
        console.log('🚀 Bulk Deleting Categories...');
        const deleteResult = await AcademicService.bulkDeleteCategories([cat1.id, cat2.id]);
        console.log(`🗑️ Deleted ${deleteResult.count} categories.`);

        // 3. Verify Deletion
        const remaining = await prisma.academicCategory.findMany({
            where: { id: { in: [cat1.id, cat2.id] } }
        });

        if (remaining.length === 0) {
            console.log('✅ SUCCESS: Categories deleted successfully.');
        } else {
            console.error('❌ FAILED: Categories still exist.');
        }

    } catch (error) {
        console.error('❌ verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyBulkDelete();
