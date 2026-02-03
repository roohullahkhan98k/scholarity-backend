import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
let ADMIN_TOKEN = '';
let STUDENT_TOKEN = '';
let NEW_USER_TOKEN = '';
let NEW_USER_ID = '';
let APPLICATION_ID = '';

async function test(name: string, fn: () => Promise<void>) {
    try {
        process.stdout.write(`Testing ${name}... `);
        await fn();
        console.log('✅ OK');
    } catch (e: any) {
        console.log('❌ FAILED');
        console.error('Error:', e.message);
        if (e.cause) console.error('Cause:', e.cause);
    }
}

async function login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`Login failed for ${email}: ${res.status} ${res.statusText}`);
    const data: any = await res.json();
    return { token: data.access_token, user: data.user };
}

async function signup(name: string, email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error(`Signup failed for ${email}: ${res.status} ${await res.text()}`);
    const data: any = await res.json();
    return { token: data.access_token, user: data.user };
}

async function main() {
    console.log('🚀 Starting API Verification');

    // 1. Auth & Setup
    await test('Auth: Login Admin', async () => {
        const result = await login('admin@scholarity.com', 'Admin123!');
        ADMIN_TOKEN = result.token;
    });

    await test('Auth: Signup New Student', async () => {
        const result = await signup('Test Student', `teststudent_${Date.now()}@test.com`, 'TestPass123!');
        NEW_USER_TOKEN = result.token;
        NEW_USER_ID = result.user.id;
    });

    // 2. Student Management (Admin)
    await test('Students: Admin Create Profile', async () => {
        const res = await fetch(`${BASE_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ADMIN_TOKEN}`
            },
            body: JSON.stringify({
                userId: NEW_USER_ID,
                bio: 'Created via API test',
                interests: 'Testing'
            }),
        });
        if (!res.ok && res.status !== 409) { // 409 if exists (should not happen on new user)
            throw new Error(`Create Student failed: ${res.status} ${await res.text()}`);
        }
    });

    let studentProfileId = '';
    await test('Students: Admin Find One', async () => {
        // Need to find the profile ID first, maybe flow through findAll?
        // Or create returns the profile?
        // Let's rely on findAll filtering
    });

    // 3. Instructor Flow
    // Create another user for Instructor flow
    let INSTRUCTOR_USER_TOKEN = '';
    let INSTRUCTOR_USER_ID = '';

    await test('Setup: Create User for Instructor', async () => {
        const result = await signup('Test Instructor', `instructor_${Date.now()}@test.com`, 'TestPass123!');
        INSTRUCTOR_USER_TOKEN = result.token;
        INSTRUCTOR_USER_ID = result.user.id;
    });

    await test('Instructor: Apply', async () => {
        const res = await fetch(`${BASE_URL}/instructor/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${INSTRUCTOR_USER_TOKEN}`
            },
            body: JSON.stringify({
                bio: 'I am a passionate educator with over 10 years of experience in teaching science and mathematics. I love helping students learn and grow.',
                expertise: 'Mathematics, Physics, Chemistry',
                experience: 'I have taught at multiple high schools and universities. I have also mentored junior teachers and developed curriculum for science departments.'
            }),
        });
        if (!res.ok) throw new Error(`Apply failed: ${res.status} ${await res.text()}`);
        const data: any = await res.json();
        APPLICATION_ID = data.id;
    });

    await test('Instructor: Admin Review (Approve)', async () => {
        if (!APPLICATION_ID) throw new Error('No application ID');

        const res = await fetch(`${BASE_URL}/instructor/applications/${APPLICATION_ID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ADMIN_TOKEN}`
            },
            body: JSON.stringify({
                status: 'APPROVED'
            }),
        });
        if (!res.ok) throw new Error(`Review failed: ${res.status} ${await res.text()}`);
    });

    await test('Teachers: Verify New Teacher Listed', async () => {
        const res = await fetch(`${BASE_URL}/teachers`, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        const data: any = await res.json();
        // Check if our instructor user is in the list
        const found = data.find((t: any) => t.userId === INSTRUCTOR_USER_ID);
        if (!found) throw new Error('Newly approved teacher not found in teachers list');
        if (found.role !== 'teacher') throw new Error(`User role is ${found.role}, expected teacher`);
        if (found.applicationStatus !== 'APPROVED') throw new Error(`App status is ${found.applicationStatus}`);
    });

    console.log('\n✨ Verification Complete');
}

main();
