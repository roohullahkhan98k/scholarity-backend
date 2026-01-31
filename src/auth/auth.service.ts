import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async signup(signupDto: SignupDto) {
        const { email, password, name } = signupDto;

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get student role
        const studentRole = await this.prisma.role.findUnique({
            where: { name: 'student' },
        });

        if (!studentRole) {
            throw new Error('Student role not found in database');
        }

        // Create user
        const user = await this.prisma.user.create({
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

        // Generate JWT token
        const payload = { email: user.email, sub: user.id };
        const access_token = this.jwtService.sign(payload);

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
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const payload = { email: user.email, sub: user.id };
        const access_token = this.jwtService.sign(payload);

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
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
            isActive: user.isActive,
        };
    }
}
