import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export function validateDto(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dtoObj = plainToInstance(dtoClass, req.body);
        const errors = await validate(dtoObj, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        if (errors.length > 0) {
            const formatErrors = errors.map((error) => ({
                property: error.property,
                constraints: error.constraints,
            }));
            return res.status(400).json({ message: 'Validation failed', errors: formatErrors });
        }

        // Ideally replace req.body with the typed DTO
        req.body = dtoObj;
        next();
    };
}
