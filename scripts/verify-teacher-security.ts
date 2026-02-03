async function verifySecurityFlow() {
    console.log('🧪 Starting Teacher Security Verification...');
    const timestamp = Date.now();
    const BASE_URL = 'http://localhost:8000/api';

    const adminEmail = 'superadmin@scholarity.com';
    const adminPassword = 'Admin123!';

    try {
        // 1. Join as Guest
        console.log('📝 Joining as guest teacher...');
        const joinPayload = {
            email: `locked.teacher.${timestamp}@test.com`,
            password: 'password123',
            name: 'Locked Teacher',
            bio: 'Locked Bio',
            expertise: 'Security',
            experience: '5 years'
        };

        const joinRes = await fetch(`${BASE_URL}/instructor/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(joinPayload)
        });
        const joinData = await joinRes.json();

        if (joinRes.status !== 201) throw new Error(`Join failed: ${joinData.message}`);

        const token = joinData.access_token;
        const appId = joinData.application.id;
        console.log('✅ Joined successfully.');

        // 2. Attempt access (Should be BLOCKED with 403)
        console.log('🛡️ Testing Middleware Block (Expecting 403)...');
        const profileBlockRes = await fetch(`${BASE_URL}/teacher/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (profileBlockRes.status === 403) {
            const blockData = await profileBlockRes.json();
            console.log(`✅ SUCCESS: Access blocked with 403: "${blockData.message}"`);
        } else if (profileBlockRes.status === 401) {
            const blockData = await profileBlockRes.json();
            console.log(`✅ SUCCESS: Access blocked with 401: "${blockData.message}"`);
        } else {
            console.error(`❌ FAILED: Received status ${profileBlockRes.status} instead of 403/401`);
        }

        // 3. Admin Login & Approve
        console.log('🔑 Admin logging in...');
        const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: adminPassword })
        });
        const adminData = await adminLoginRes.json();
        const adminToken = adminData.access_token;

        console.log('🚀 Approving application...');
        await fetch(`${BASE_URL}/instructor/applications/${appId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: 'APPROVED' })
        });
        console.log('✅ Application APPROVED.');

        // 4. Attempt access again (Should SUCCEED)
        console.log('🔓 Testing Access after approval...');
        const profileRes = await fetch(`${BASE_URL}/teacher/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (profileRes.status === 200) {
            console.log('✅ SUCCESS: Profile accessed after approval!');
        } else {
            const failData = await profileRes.json();
            console.error(`❌ FAILED: Access denied with ${profileRes.status}: ${failData.message}`);
        }

    } catch (error: any) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifySecurityFlow();
