import { Request, Response } from 'express';
import { AcademicService } from '../services/academic.service';

export const listCategories = async (req: Request, res: Response) => {
    try {
        const categories = await AcademicService.listCategories();
        res.status(200).json(categories);
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
