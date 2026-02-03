import { Request, Response } from 'express';
import { RoleService } from '../../services/admin/role.service';

export const listRoles = async (req: Request, res: Response) => {
    try {
        const roles = await RoleService.listRoles();
        res.status(200).json(roles);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const listPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await RoleService.listPermissions();
        res.status(200).json(permissions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createRole = async (req: Request, res: Response) => {
    try {
        const { name, permissionIds } = req.body;
        if (!name || !Array.isArray(permissionIds)) {
            return res.status(400).json({ message: 'Name and permissionIds array are required' });
        }

        const role = await RoleService.createRole(name, permissionIds);
        res.status(201).json(role);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { permissionIds } = req.body;

        if (!Array.isArray(permissionIds)) {
            return res.status(400).json({ message: 'permissionIds array is required' });
        }

        const role = await RoleService.updateRolePermissions(id as string, permissionIds);
        res.status(200).json(role);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
