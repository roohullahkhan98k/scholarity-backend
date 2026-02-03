import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        const secret = process.env.JWT_SECRET || 'secretKey';
        const decoded: any = jwt.verify(token, secret);

        // Fetch user to ensure they still exist and are active
        const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            include: { role: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is inactive. Please wait for admin approval.' });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role.name,
            ...decoded
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
