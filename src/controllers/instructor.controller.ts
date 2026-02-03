import { Request, Response } from 'express';
import { InstructorService } from '../services/instructor.service';
import { ApplicationStatus } from '@prisma/client';

export const apply = async (req: Request, res: Response) => {
    try {
        const result = await InstructorService.applyForInstructor(req.user.id, req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const getApplications = async (req: Request, res: Response) => {
    try {
        const status = req.query.status as ApplicationStatus;
        const result = await InstructorService.getApplications(status);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const reviewApplication = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await InstructorService.reviewApplication(id as string, req.body, req.user.id);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};
