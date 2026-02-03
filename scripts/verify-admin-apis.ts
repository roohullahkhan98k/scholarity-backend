import prisma from '../src/prisma';
import { AdminUserService } from '../src/services/admin/user.service';
import { AcademicService } from '../src/services/academic.service';
import { RoleService } from '../src/services/admin/role.service';

const verifyAdminAPIs = async () => {
    console.log('🧪 Starting Admin API Verification...');

    try {
        // 1. Verify Academic Service
        console.log('\nPlease verify Academic APIs:');
        const category = await AcademicService.createCategory('Test Category ' + Date.now());
        console.log('✅ Created Category:', category.name);

        const subject = await AcademicService.createSubject('Test Subject', category.id);
        console.log('✅ Created Subject:', subject.name);

        const categories = await AcademicService.listCategories();
        console.log('✅ Listed Categories:', categories.length);

        // 2. Verify Role Service
        console.log('\nPlease verify Role APIs:');
        const roles = await RoleService.listRoles();
        console.log('✅ Listed Roles:', roles.map(r => r.name).join(', '));

        const permissions = await RoleService.listPermissions();
        if (permissions.length > 0) {
            const newRole = await RoleService.createRole('TEST_ROLE_' + Date.now(), [permissions[0].id]);
            console.log('✅ Created Role:', newRole.name);

            const updatedRole = await RoleService.updateRolePermissions(newRole.id, []);
            console.log('✅ Updated Role Permissions (Cleared)');

            // Cleanup
            await prisma.role.delete({ where: { id: newRole.id } });
        }

        // 3. Verify Admin User Service
        console.log('\nPlease verify User Management APIs:');
        const users = await AdminUserService.getAllUsers(1, 10);
        console.log('✅ Listed Users:', users.total);
        if (users.users.length > 0) {
            const user = users.users[0];
            await AdminUserService.toggleUserStatus(user.id, !user.isActive);
            console.log('✅ Toggled User Status');
            await AdminUserService.toggleUserStatus(user.id, !user.isActive); // Revert
        }

        console.log('\n✨ All Admin Services Verified Successfully!');
    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

verifyAdminAPIs();
