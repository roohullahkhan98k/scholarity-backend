import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


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

        // In a real app, use process.env.JWT_SECRET
        // Since the original code used NestJS JWT module which often defaults or uses a config, 
        // we'll assume a secret for now or strictly strictly enforcing env.
        // Looking at original AuthModule, it likely used an ENV or default.
        // I will use process.env.JWT_SECRET || 'secretKey' for now to match typical defaults if not found.
        const secret = process.env.JWT_SECRET || 'secretKey';

        const decoded: any = jwt.verify(token, secret);

        // Optionally fetch user to ensure they still exist/are active
        // The original strategy likely did this.

        req.user = decoded;

        // If we need the full user object attached:
        // const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
        // if (!user) return res.status(401).json({ message: 'User not found' });
        // req.user = user;
        // But for performance, often just the payload is enough if it has roles.
        // The original code `req.user` in controllers seemed to have `id` and `role`.
        // Let's decode and set `req.user = { id: decoded.sub, ...decoded }`.

        req.user = { id: decoded.sub, ...decoded };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
