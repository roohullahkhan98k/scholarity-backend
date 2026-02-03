import prisma from '../src/prisma';

async function main() {
    console.log('🌱 Seeding Roles & Permissions...');

    const roles = ['SUPER_ADMIN', 'TEACHER', 'STUDENT'];
    const permissions = [
        'MANAGE_USERS',
        'MANAGE_ROLES',
        'APPROVE_STAFF',
        'MANAGE_ACADEMIC',
        'MANAGE_COURSES',
        'APPROVE_COURSE',
        'VIEW_REPORTS',
        'CREATE_COURSE',
        'VIEW_COURSE',
        'ENROLL_COURSE',
    ];

    // 1. Create Permissions
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm },
            update: {},
            create: { name: perm },
        });
    }

    // 2. Create Roles
    for (const roleName of roles) {
        const role = await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        });
        console.log(`✅ Role: ${roleName}`);
    }

    // 3. Assign Permissions to SUPER_ADMIN (All permissions)
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    const allPermissions = await prisma.permission.findMany();

    if (superAdminRole) {
        await prisma.role.update({
            where: { id: superAdminRole.id },
            data: {
                permissions: {
                    connect: allPermissions.map((p) => ({ id: p.id })),
                },
            },
        });
        console.log('👑 SUPER_ADMIN granted all permissions');
    }

    console.log('✨ RBAC Seeding Complete');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
