import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Routes
import authRoutes from './routes/auth.routes';
import instructorRoutes from './routes/instructor.routes';
import studentsRoutes from './routes/students.routes';
import teachersRoutes from './routes/teachers.routes';

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/instructor', instructorRoutes);
app.use('/students', studentsRoutes);
app.use('/teachers', teachersRoutes);

// Health check
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Scholarity Backend is running' });
});

export default app;
