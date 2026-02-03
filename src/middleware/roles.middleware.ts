import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export const authorize = (roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // We need to fetch the user's role if it's not in the token.
        // The JWT payload in AuthService.login was { email, sub }.
        // So we likely need to fetch the user to get the role, OR we should update the JWT to include the role.
        // For now, let's fetch the user to be safe and accurate, matching the original Guard behavior which typically validates the user.

        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: { role: true }
            });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!roles.includes(user.role.name)) {
                return res.status(403).json({ message: 'Forbidden resource' });
            }

            // Attach full user to req for convenience if not already
            req.user = user;
            next();
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};
