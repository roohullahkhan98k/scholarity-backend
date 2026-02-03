import { Request, Response } from 'express';
import { TeacherService } from '../services/teacher.service';

export const getProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const profile = await TeacherService.getProfile((req.user as any).id);
        const verification = await TeacherService.getVerificationStatus((req.user as any).id);

        res.status(200).json({ profile, verification });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { bio, experience, expertise } = req.body;

        const updatedProfile = await TeacherService.updateProfile(req.user.id, {
            bio,
            experience,
            expertise
        });

        res.status(200).json(updatedProfile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
