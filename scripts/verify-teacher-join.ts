async function verifyJoinFlow() {
    console.log('🧪 Starting Teacher Join Verification...');
    const timestamp = Date.now();
    const API_URL = 'http://localhost:8000/api/instructor/join';

    const payload = {
        email: `onboarding.teacher.${timestamp}@test.com`,
        password: 'password123',
        name: 'Onboarding Test Teacher',
        bio: 'I want to teach software engineering.',
        expertise: 'Programming',
        experience: '1 year'
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.status === 201) {
            console.log('✅ Account & Application created in ONE step!');
            console.log('🔑 Token received:', data.access_token ? 'YES' : 'NO');
            console.log('📄 Application ID:', data.application.id);
            console.log('📬 Status:', data.application.status);
            console.log('🏁 SUCCESS: Teacher Onboarding works!');
        } else {
            console.error('❌ Onboarding failed:', data.message);
        }

    } catch (error: any) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifyJoinFlow();
