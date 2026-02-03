import { Request, Response } from 'express';
import { StudentsService } from '../services/students.service';

export const create = async (req: Request, res: Response) => {
    try {
        const result = await StudentsService.create(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const findAll = async (req: Request, res: Response) => {
    try {
        const result = await StudentsService.findAll();
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const findOne = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await StudentsService.findOne(id as string);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await StudentsService.update(id as string, req.body);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await StudentsService.remove(id as string);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};
