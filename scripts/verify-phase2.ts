import prisma from '../src/prisma';
import { CourseService } from '../src/services/course.service';
import { TeacherService } from '../src/services/teacher.service';
import { AdminUserService } from '../src/services/admin/user.service';

const verifyPhase2 = async () => {
    console.log('🧪 Starting Phase 2 Verification (Teacher & Course)...');

    // 1. Create a User and Promote to Teacher (Setup)
    console.log('\n--- Setup: Teacher Account ---');
    const teacherUser = await prisma.user.create({
        data: {
            email: 'teacher.verify@test.com',
            password: 'hashedpassword',
            name: 'Verification Teacher',
            isActive: true,
            role: { connect: { name: 'TEACHER' } }
        }
    });

    // Create Teacher Profile directly for testing (simulating application approval result)
    await prisma.teacher.create({
        data: {
            userId: teacherUser.id,
            bio: 'Experienced Educator',
            expertise: 'Physics'
        }
    });
    console.log('✅ Created Test Teacher:', teacherUser.email);

    try {
        // 2. Teacher Profile Update
        console.log('\n--- Verify Teacher Profile API ---');
        const updatedProfile = await TeacherService.updateProfile(teacherUser.id, {
            experience: '10 Years',
            expertise: 'Advanced Physics'
        });
        console.log('✅ Updated Profile Experience:', updatedProfile.experience);

        // 3. Create Course Draft
        console.log('\n--- Verify Course Draft Creation ---');
        // Need a Category and Subject first
        const category = await prisma.academicCategory.create({ data: { name: 'Phase2_Cat' } });
        const subject = await prisma.subject.create({
            data: { name: 'Phase2_Sub', categoryId: category.id }
        });

        const course = await CourseService.createCourse(teacherUser.id, {
            title: 'Complete Physics Guide',
            description: 'A test course description',
            categoryId: category.id,
            subjectId: subject.id,
            price: 49.99
        });
        console.log('✅ Created Course Draft:', course.title, `(${course.status})`);

        // 4. Add Unit
        console.log('\n--- Verify Unit Addition ---');
        const unit = await CourseService.addUnit(course.id, 'Kinematics', 1);
        console.log('✅ Created Unit:', unit.title);

        // 5. Add Lesson (Video Upload)
        console.log('\n--- Verify Lesson (Upload) ---');
        const videoLesson = await CourseService.addLesson(unit.id, {
            title: 'Intro to Motion',
            order: 1,
            type: 'VIDEO',
            duration: 600,
            videoUrl: 'https://cdn.mysite.com/video1.mp4'
        });
        console.log('✅ Created Video Lesson:', videoLesson.title, videoLesson.videoUrl);

        // 6. Add Lesson (YouTube Embed)
        console.log('\n--- Verify Lesson (YouTube) ---');
        const ytLesson = await CourseService.addLesson(unit.id, {
            title: 'Speed vs Velocity (YT)',
            order: 2,
            type: 'VIDEO',
            duration: 900,
            videoUrl: 'https://youtube.com/watch?v=123456'
        });
        console.log('✅ Created YouTube Lesson:', ytLesson.title, ytLesson.videoUrl);

        // 7. Get Full Details
        console.log('\n--- Verify Course Details Fetch ---');
        const details = await CourseService.getCourseDetails(course.id);
        const totalLessons = details?.units[0].lessons.length;
        console.log(`✅ Retrieved Full Course with ${totalLessons} lessons.`);

        console.log('\n✨ Phase 2 Verification Success!');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        // Cleanup
        await prisma.lesson.deleteMany({ where: { unit: { course: { teacher: { userId: teacherUser.id } } } } });
        await prisma.unit.deleteMany({ where: { course: { teacher: { userId: teacherUser.id } } } });
        await prisma.course.deleteMany({ where: { teacher: { userId: teacherUser.id } } });
        await prisma.teacher.delete({ where: { userId: teacherUser.id } });
        await prisma.user.delete({ where: { id: teacherUser.id } });
        await prisma.subject.deleteMany({ where: { name: 'Phase2_Sub' } });
        await prisma.academicCategory.deleteMany({ where: { name: 'Phase2_Cat' } });
        await prisma.$disconnect();
    }
};

verifyPhase2();
