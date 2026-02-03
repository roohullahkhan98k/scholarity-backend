import { Request, Response } from 'express';
import { AdminUserService } from '../../services/admin/user.service';

export const listUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const roleId = req.query.roleId as string;

        const result = await AdminUserService.getAllUsers(page, limit, search, roleId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const result = await AdminUserService.toggleUserStatus(id as string, isActive);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const changeUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { roleName } = req.body;

        const result = await AdminUserService.changeUserRole(id as string, roleName);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const approveTeacher = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Application ID
        const result = await AdminUserService.approveTeacher(id as string);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
