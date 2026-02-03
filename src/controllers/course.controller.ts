import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';

export const createCourse = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { title, description, categoryId, subjectId, thumbnail, price } = req.body;

        const course = await CourseService.createCourse((req.user as any).id, {
            title, description, categoryId, subjectId, thumbnail, price
        });

        res.status(201).json(course);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCourse = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const { title, description, categoryId, subjectId, thumbnail, price } = req.body;

        const course = await CourseService.updateCourse(id, (req.user as any).id, {
            title, description, categoryId, subjectId, thumbnail, price
        });

        res.status(200).json(course);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addUnit = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const { title, order } = req.body;

        const unit = await CourseService.addUnit(courseId as string, title, order);
        res.status(201).json(unit);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addLesson = async (req: Request, res: Response) => {
    try {
        const { unitId } = req.params;
        const { title, order, type, duration, videoUrl, isFree, resources } = req.body;

        console.log('➡️ [API] Add Lesson Request:', { unitId });
        console.log('📦 [API] Payload:', { title, type, resourcesLength: resources?.length });

        const lesson = await CourseService.addLesson(unitId as string, {
            title, order, type, duration, videoUrl, isFree, resources
        });

        res.status(201).json(lesson);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyCourses = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const courses = await CourseService.getTeacherCourses((req.user as any).id);
        res.status(200).json(courses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCourseDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const course = await CourseService.getCourseDetails(id as string);
        res.status(200).json(course);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const submitForReview = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;

        const course = await CourseService.submitCourse(id as string, (req.user as any).id);
        res.status(200).json(course);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const listCourses = async (req: Request, res: Response) => {
    try {
        const { search, categoryId, subjectId, status, page, limit } = req.query;
        const result = await CourseService.listCourses({
            search: search as string,
            categoryId: categoryId as string,
            subjectId: subjectId as string,
            status: status as any,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined
        });
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        await CourseService.deleteCourse(id as string, (req.user as any).id, (req.user as any).role);
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleCourseStatus = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const result = await CourseService.toggleCourseStatus(id as string, (req.user as any).id, (req.user as any).role);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
