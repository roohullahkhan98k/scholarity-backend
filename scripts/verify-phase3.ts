import prisma from '../src/prisma';
import { CourseService } from '../src/services/course.service';
import { CourseStatus } from '@prisma/client';

const verifyPhase3 = async () => {
    console.log('🧪 Starting Phase 3 Verification (Review & Moderation)...');

    // Setup: User, Teacher, Category, Subject
    console.log('\n--- Setup ---');
    const timestamp = Date.now();
    const user = await prisma.user.create({
        data: {
            email: `phase3.teacher.${timestamp}@test.com`,
            password: 'hashed',
            name: 'Phase 3 Teacher',
            isActive: true,
            role: { connect: { name: 'TEACHER' } }
        }
    });
    await prisma.teacher.create({ data: { userId: user.id } });

    const cat = await prisma.academicCategory.create({ data: { name: `P3_Cat_${timestamp}` } });
    const sub = await prisma.subject.create({ data: { name: `P3_Sub_${timestamp}`, categoryId: cat.id } });

    try {
        // 1. Create Draft
        const course = await CourseService.createCourse(user.id, {
            title: 'Test Review Course',
            description: 'Desc',
            categoryId: cat.id,
            subjectId: sub.id,
            price: 100
        });
        console.log('✅ Created Draft:', course.title, course.status);

        // DEBUG: Test Log Creation directly
        console.log('\n--- DEBUG: Test Log Creation ---');
        try {
            await prisma.courseLog.create({
                data: {
                    courseId: course.id,
                    userId: user.id,
                    action: 'TEST',
                    comment: 'Debug log'
                }
            });
            console.log('✅ DEBUG: Log created manually');
        } catch (err: any) {
            console.error('❌ DEBUG: Log creation failed:', JSON.stringify(err, null, 2));
            throw err;
        }

        // 2. Submit for Review
        console.log('\n--- Teacher Submission ---');
        const [submitted] = await CourseService.submitCourse(course.id, user.id);
        console.log('✅ Submitted Course:', submitted.title, submitted.status);

        // 3. Admin Review (Pending List)
        console.log('\n--- Admin Review ---');
        const pending = await CourseService.listPendingCourses(1, 10);
        console.log('✅ Pending Courses Count:', pending.total);
        const target = pending.courses.find(c => c.id === course.id);
        if (target) {
            console.log('✅ Found submitted course in pending list');
        } else {
            throw new Error('Submitted course not found in pending list');
        }

        // 4. Reject
        console.log('\n--- Admin Reject ---');
        // Use teacher ID as admin ID for test simplicity or create new admin
        const [rejected] = await CourseService.rejectCourse(course.id, user.id, 'Change title');
        console.log('✅ Rejected Course:', rejected.status, 'Reason:', rejected.adminComments);

        // 5. Re-Submit
        console.log('\n--- Re-Submission ---');
        const [resubmitted] = await CourseService.submitCourse(course.id, user.id);
        console.log('✅ Re-Submitted Course:', resubmitted.status);

        // 6. Approve
        console.log('\n--- Admin Approve ---');
        const [approved] = await CourseService.approveCourse(course.id, user.id);
        console.log('✅ Approved Course:', approved.status);

        // 7. Verify Logs
        console.log('\n--- Verify Logs ---');
        const logs = await CourseService.getCourseLogs(course.id);
        console.log(`✅ Retrieved ${logs.length} logs.`);
        logs.forEach(log => console.log(`   - [${log.action}] ${log.comment} by ${log.user.email}`));

        console.log('\n✨ Phase 3 Verification Success!');

    } catch (e: any) {
        console.error('❌ Verification Failed:', JSON.stringify(e, null, 2));
    } finally {
        // Cleanup
        await prisma.courseLog.deleteMany({ where: { courseId: { not: '' } } }).catch(() => { }); // Safety delete
        await prisma.course.deleteMany({ where: { id: { not: '' } } }).catch(() => { }); // Safety delete
        await prisma.teacher.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
        await prisma.subject.deleteMany({ where: { id: sub.id } });
        await prisma.academicCategory.delete({ where: { id: cat.id } });
        await prisma.$disconnect();
    }
};

verifyPhase3();
