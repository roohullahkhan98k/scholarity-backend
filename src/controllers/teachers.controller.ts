import { Request, Response } from 'express';
import { TeachersService } from '../services/teachers.service';

export const create = async (req: Request, res: Response) => {
    try {
        const result = await TeachersService.create(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const findAll = async (req: Request, res: Response) => {
    try {
        const result = await TeachersService.findAll();
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const findOne = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await TeachersService.findOne(id as string);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await TeachersService.update(id as string, req.body);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await TeachersService.remove(id as string);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};
