import { Request, Response } from 'express';
import { AcademicService } from '../services/academic.service';
import { ApplicationStatus } from '@prisma/client';

// ... (existing methods)

export const requestAcademicItem = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const { type, name, categoryId } = req.body;

        const request = await AcademicService.requestAcademicItem((req.user as any).id, { type, name, categoryId });
        res.status(201).json(request);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const listAcademicRequests = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const requests = await AcademicService.listRequests(status as ApplicationStatus);
        res.status(200).json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const resolveAcademicRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const result = await AcademicService.resolveRequest(id as string, status as ApplicationStatus, reason);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const listCategories = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const categories = await AcademicService.listCategories(search as string);
        res.status(200).json(categories);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const listSubjects = async (req: Request, res: Response) => {
    try {
        const { categoryId, search } = req.query;
        const subjects = await AcademicService.listSubjects(search as string, categoryId as string);
        res.status(200).json(subjects);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const category = await AcademicService.createCategory(name);
        res.status(201).json(category);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await AcademicService.updateCategory(id as string, name);
        res.status(200).json(category);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AcademicService.deleteCategory(id as string);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkDeleteCategories = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'IDs array is required' });
        }
        await AcademicService.bulkDeleteCategories(ids);
        res.status(200).json({ message: 'Categories deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createSubject = async (req: Request, res: Response) => {
    try {
        const { name, categoryId } = req.body;
        if (!name || !categoryId) return res.status(400).json({ message: 'Name and CategoryId are required' });

        const subject = await AcademicService.createSubject(name, categoryId);
        res.status(201).json(subject);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSubject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const subject = await AcademicService.updateSubject(id as string, name);
        res.status(200).json(subject);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSubject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AcademicService.deleteSubject(id as string);
        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkDeleteSubjects = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'IDs array is required' });
        }
        await AcademicService.bulkDeleteSubjects(ids);
        res.status(200).json({ message: 'Subjects deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
