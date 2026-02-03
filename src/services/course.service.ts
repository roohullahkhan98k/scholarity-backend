import prisma from '../prisma';
import { CourseStatus, LessonType, ResourceType } from '@prisma/client';

export class CourseService {

    // Create Draft Course
    static async createCourse(teacherUserId: string, data: {
        title: string;
        description: string;
        categoryId: string;
        subjectId: string;
        thumbnail?: string;
        price?: number;
    }) {
        // 1. Get Teacher ID from User ID
        const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUserId } });
        if (!teacher) throw new Error('Teacher profile not found. Complete your profile first.');

        // 2. Create Course
        return prisma.course.create({
            data: {
                title: data.title,
                description: data.description,
                categoryId: data.categoryId,
                subjectId: data.subjectId,
                thumbnail: data.thumbnail,
                price: data.price || 0,
                duration: 0,
                teacherId: teacher.id,
                status: CourseStatus.DRAFT
            }
        });
    }

    // Update Course Draft
    static async updateCourse(courseId: string, teacherUserId: string, data: {
        title?: string;
        description?: string;
        categoryId?: string;
        subjectId?: string;
        thumbnail?: string;
        price?: number;
    }) {
        const teacher = await prisma.teacher.findUnique({ where: { userId: teacherUserId } });
        if (!teacher) throw new Error('Teacher profile not found.');

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new Error('Course not found');
        if (course.teacherId !== teacher.id) throw new Error('Unauthorized');

        return prisma.course.update({
            where: { id: courseId },
            data: {
                title: data.title,
                description: data.description,
                categoryId: data.categoryId,
                subjectId: data.subjectId,
                thumbnail: data.thumbnail,
                price: data.price,
                // Critical: Identifying edits to live content
                // If course was APPROVED or REJECTED, and teacher edits it -> Reset to PENDING for re-review
                status: (course.status === CourseStatus.APPROVED || course.status === CourseStatus.REJECTED)
                    ? CourseStatus.PENDING
                    : course.status // Keep as DRAFT or PENDING
            }
        });
    }

    // Add Unit to Course
    static async addUnit(courseId: string, title: string, order: number) {
        return prisma.unit.create({
            data: {
                title,
                order,
                courseId
            }
        });
    }

    // Add Lesson to Unit
    static async addLesson(unitId: string, data: {
        title: string;
        order?: number;
        type?: LessonType;
        duration?: number;
        videoUrl?: string; // YouTube or Uploaded Video URL
        isFree?: boolean;
        resources?: Array<{ title: string; url: string; type: any }>; // Support multiple documents
    }) {
        // Smart Defaulting for Type
        let lessonType = data.type;
        if (!lessonType) {
            if (data.videoUrl) lessonType = LessonType.VIDEO;
            else if (data.resources && data.resources.length > 0) lessonType = LessonType.DOCUMENT;
            else lessonType = LessonType.VIDEO; // Fallback
        }

        return prisma.lesson.create({
            data: {
                title: data.title,
                order: data.order || 1, // Default order
                type: lessonType,
                duration: data.duration || 0,
                videoUrl: data.videoUrl,
                isFree: data.isFree || false,
                unitId,
                resources: data.resources ? {
                    create: data.resources.map(r => {
                        // Handle if resource is just a string URL (flat array)
                        if (typeof r === 'string') {
                            const filename = (r as string).split('/').pop() || 'Resource';
                            return {
                                title: filename,
                                url: r,
                                type: ResourceType.OTHER
                            };
                        }
                        // Handle object
                        return {
                            title: r.title,
                            url: r.url,
                            type: (r.type as ResourceType) || ResourceType.OTHER
                        };
                    })
                } : undefined
            },
            include: {
                resources: true
            }
        });
    }

    // Get Teacher's Courses
    static async getTeacherCourses(teacherUserId: string) {
        return prisma.course.findMany({
            where: {
                teacher: { userId: teacherUserId }
            },
            include: {
                category: true,
                subject: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Get Full Course Details (for Editing)
    static async getCourseDetails(courseId: string) {
        return prisma.course.findUnique({
            where: { id: courseId },
            include: {
                units: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                            include: { resources: true }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });
    }

    // Submit Course for Review
    static async submitCourse(courseId: string, teacherUserId: string) {
        const course = await prisma.course.findFirst({
            where: { id: courseId, teacher: { userId: teacherUserId } }
        });

        if (!course) throw new Error('Course not found or unauthorized');
        if (course.status !== CourseStatus.DRAFT && course.status !== CourseStatus.REJECTED) {
            throw new Error('Only Draft or Rejected courses can be submitted');
        }

        return prisma.$transaction([
            prisma.course.update({
                where: { id: courseId },
                data: { status: CourseStatus.PENDING }
            }),
            prisma.courseLog.create({
                data: {
                    courseId,
                    userId: teacherUserId,
                    action: 'SUBMITTED',
                    comment: 'Submitted for review'
                }
            })
        ]);
    }

    // Admin: List Pending Courses
    static async listPendingCourses(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const where = { status: CourseStatus.PENDING };

        const [courses, total] = await prisma.$transaction([
            prisma.course.findMany({
                where,
                skip,
                take: limit,
                include: { teacher: { include: { user: true } }, category: true },
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.course.count({ where })
        ]);

        return { courses, total, page, totalPages: Math.ceil(total / limit) };
    }

    // Admin: Approve Course
    static async approveCourse(courseId: string, adminId: string) {
        return prisma.$transaction([
            prisma.course.update({
                where: { id: courseId },
                data: { status: CourseStatus.APPROVED }
            }),
            prisma.courseLog.create({
                data: {
                    courseId,
                    userId: adminId,
                    action: 'APPROVED',
                    comment: 'Course Approved'
                }
            })
        ]);
    }

    // Admin: Reject Course
    static async rejectCourse(courseId: string, adminId: string, reason: string) {
        return prisma.$transaction([
            prisma.course.update({
                where: { id: courseId },
                data: {
                    status: CourseStatus.REJECTED,
                    adminComments: reason
                }
            }),
            prisma.courseLog.create({
                data: {
                    courseId,
                    userId: adminId,
                    action: 'REJECTED',
                    comment: reason
                }
            })
        ]);
    }

    // Get Course Logs
    static async getCourseLogs(courseId: string) {
        return prisma.courseLog.findMany({
            where: { courseId },
            include: { user: { select: { name: true, email: true, role: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Delete Course (Teacher: Draft Only, Admin: Any)
    static async deleteCourse(courseId: string, userId: string, role: string) {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new Error('Course not found');

        // Teacher Logic
        if (role === 'teacher') {
            const teacher = await prisma.teacher.findUnique({ where: { userId } });
            if (!teacher || course.teacherId !== teacher.id) throw new Error('Unauthorized');
            if (course.status !== CourseStatus.DRAFT && course.status !== CourseStatus.REJECTED) {
                throw new Error('You can only delete Draft or Rejected courses.');
            }
        }

        // Admin can delete anything, Teacher matches logic above
        return prisma.course.delete({ where: { id: courseId } });
    }

    // Toggle Course Status (Activate/Deactivate)
    static async toggleCourseStatus(courseId: string, userId: string, role: string) {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new Error('Course not found');

        let newStatus: CourseStatus;

        if (role === 'teacher') {
            const teacher = await prisma.teacher.findUnique({ where: { userId } });
            if (!teacher || course.teacherId !== teacher.id) throw new Error('Unauthorized');

            // Teacher can only toggle Published <-> Disabled (Unpublish)
            if (course.status === CourseStatus.APPROVED) newStatus = CourseStatus.DISABLED;
            else if (course.status === CourseStatus.DISABLED) newStatus = CourseStatus.APPROVED;
            else throw new Error('Only active courses can be deactivated.');
        } else {
            // Admin Logic
            if (course.status === CourseStatus.APPROVED) newStatus = CourseStatus.DISABLED;
            else if (course.status === CourseStatus.DISABLED) newStatus = CourseStatus.APPROVED;
            else throw new Error('Course is not in a togglable state.');
        }

        return prisma.course.update({
            where: { id: courseId },
            data: { status: newStatus }
        });
    }

    // Public/Admin Course Listing (Search & Filter)
    static async listCourses(filters: {
        search?: string;
        categoryId?: string;
        subjectId?: string;
        status?: CourseStatus;
        page?: number;
        limit?: number;
    }) {
        const { search, categoryId, subjectId, status, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (categoryId) where.categoryId = categoryId;
        if (subjectId) where.subjectId = subjectId;

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [courses, total] = await prisma.$transaction([
            prisma.course.findMany({
                where,
                skip,
                take: limit,
                include: {
                    teacher: { include: { user: { select: { name: true } } } },
                    category: true,
                    subject: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.course.count({ where })
        ]);

        return {
            courses,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}
