import prisma from '../../prisma';

export class RoleService {

    static async listRoles() {
        return prisma.role.findMany({
            include: { permissions: true }
        });
    }

    static async listPermissions() {
        return prisma.permission.findMany();
    }

    static async createRole(name: string, permissionIds: string[]) {
        // Validate permissions exist
        const permissions = await prisma.permission.findMany({
            where: { id: { in: permissionIds } }
        });

        if (permissions.length !== permissionIds.length) {
            throw new Error('Some permissions not found');
        }

        return prisma.role.create({
            data: {
                name,
                permissions: {
                    connect: permissionIds.map(id => ({ id }))
                }
            },
            include: { permissions: true }
        });
    }

    static async updateRolePermissions(roleId: string, permissionIds: string[]) {
        // First disconnect all, then connect new ones
        // Or cleaner: use 'set' if Prisma supports it for many-to-many, 
        // but 'set' is usually for setting foreign keys. For implicit m-n, 'set' works in recent Prisma versions.

        return prisma.role.update({
            where: { id: roleId },
            data: {
                permissions: {
                    set: permissionIds.map(id => ({ id }))
                }
            },
            include: { permissions: true }
        });
    }
}
