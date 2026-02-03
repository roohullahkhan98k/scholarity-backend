import prisma from '../prisma';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SignupDto } from '../dtos/auth/signup.dto';
import { LoginDto } from '../dtos/auth/login.dto';

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

export const AuthService = {
    async signup(signupDto: SignupDto) {
        const { email, password, name } = signupDto;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw { status: 409, message: 'User with this email already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const studentRole = await prisma.role.findUnique({
            where: { name: 'student' },
        });

        if (!studentRole) {
            throw { status: 500, message: 'Student role not found in database' };
        }

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                roleId: studentRole.id,
            },
            include: {
                role: true,
            },
        });

        const payload = { email: user.email, sub: user.id };
        const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name,
                isActive: user.isActive,
            },
        };
    },

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        if (!user.isActive) {
            throw { status: 401, message: 'Account is inactive' };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        const payload = { email: user.email, sub: user.id };
        const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.name,
                isActive: user.isActive,
            },
        };
    },

    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
            isActive: user.isActive,
        };
    }
};
