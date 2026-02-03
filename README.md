# Scholarity Backend

Migrated from NestJS to Express + TypeScript. This backend serves the Scholarity application, managing users, authentication, instructor applications, and student/teacher profiles.

## Project Setup

```bash
$ npm install
```

## Database Setup

Ensure you have your `.env` file configured with `DATABASE_URL` (and `DIRECT_URL` if using Supabase/pooling).

```bash
# Generate Prisma Client
$ npx prisma generate

# Seed Database (Optional)
$ npx ts-node prisma/seed.ts
```

## Compile and Run

```bash
# Development (with nodemon)
$ npm run dev

# Production Build
$ npm run build

# Start Production Server
$ npm start
```

## API Verification

To verify the APIs are working correctly:

```bash
$ npx ts-node scripts/verify-apis.ts
```

## Documentation

- [API Testing Guide](docs/API_TESTING.md)
- [Frontend Integration](docs/FRONTEND_INTEGRATION.md)
- [Teacher/Student API Details](docs/TEACHER_STUDENT_API.md)

## License

[MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
