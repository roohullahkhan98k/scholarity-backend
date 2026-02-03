import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

// Routes
import authRoutes from './routes/auth.routes';
import instructorRoutes from './routes/instructor.routes';
import academicRoutes from './routes/academic.routes';
import adminUserRoutes from './routes/admin/user.routes';
import adminRoleRoutes from './routes/admin/role.routes';
import adminCourseRoutes from './routes/admin/course.routes';
import teacherRoutes from './routes/teacher.routes';
import courseRoutes from './routes/course.routes';
import uploadRoutes from './routes/upload.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Static Files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes); // Profile & Verification
app.use('/api/courses', courseRoutes); // Course Management
app.use('/api/upload', uploadRoutes);
// app.use('/api/students', studentsRoutes);
app.use('/api/instructor', instructorRoutes); // Public & Student endpoints
app.use('/api/academic', academicRoutes);

// Admin Routes
app.use('/api/admin', adminUserRoutes); // /users...
app.use('/api/admin', adminRoleRoutes); // /roles...
app.use('/api/admin/courses', adminCourseRoutes); // /pending, /:id/approve
app.use('/api/admin/instructor', instructorRoutes); // /applications


// Health check
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Scholarity Backend is running' });
});

// Error Handling
app.use(errorHandler);

export default app;
