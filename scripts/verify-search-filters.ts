import prisma from '../src/prisma';
import { CourseService } from '../src/services/course.service';
import { AcademicService } from '../src/services/academic.service';

async function verifySearchFlow() {
    console.log('🧪 Starting Search & Filter Verification...');

    try {
        // 1. Search for a Category
        console.log('🔍 Searching for category "Graphic"...');
        const categories = await AcademicService.listCategories('Graphic');
        console.log(`Found ${categories.length} categories.`);
        if (categories.length > 0) {
            console.log('✅ Found category:', categories[0].name);
        }

        // 2. Search for a Subject
        console.log('🔍 Searching for subject "Public"...');
        const subjects = await AcademicService.listSubjects('Public');
        console.log(`Found ${subjects.length} subjects.`);

        // 3. Search for a Course
        console.log('🔍 Searching for courses with keyword "Quantum"...');
        const courseResults = await CourseService.listCourses({ search: 'Quantum' });
        console.log(`Found ${courseResults.total} courses matching "Quantum".`);

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifySearchFlow();
