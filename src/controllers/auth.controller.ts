import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const signup = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.signup(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.login(req.body);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const result = await AuthService.getProfile((req.user as any).id);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    res.status(200).json({
        message: 'Logged out successfully',
        userId: (req.user as any).id,
    });
};
