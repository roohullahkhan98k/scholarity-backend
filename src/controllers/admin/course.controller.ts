import { Request, Response } from 'express';
import { CourseService } from '../../services/course.service';

export const listPendingCourses = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await CourseService.listPendingCourses(page, limit);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const approveCourse = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const result = await CourseService.approveCourse(id as string, (req.user as any).id);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectCourse = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

        const result = await CourseService.rejectCourse(id as string, (req.user as any).id, reason);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCourseLogs = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await CourseService.getCourseLogs(id as string);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
