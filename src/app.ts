import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Routes
import authRoutes from './routes/auth.routes';
import instructorRoutes from './routes/instructor.routes';
import academicRoutes from './routes/academic.routes';
import adminUserRoutes from './routes/admin/user.routes';
import adminRoleRoutes from './routes/admin/role.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/teachers', teachersRoutes);
// app.use('/api/students', studentsRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/admin', adminRoleRoutes);

// Health check
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Scholarity Backend is running' });
});

export default app;
