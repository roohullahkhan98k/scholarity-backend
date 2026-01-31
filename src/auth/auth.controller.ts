import { Controller, Post, Get, Body, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    async signup(@Body(ValidationPipe) signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('login')
    async login(@Body(ValidationPipe) loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req) {
        // JWT tokens are stateless, so logout is primarily client-side
        // This endpoint can be used for logging/analytics
        return {
            message: 'Logged out successfully',
            userId: req.user.id,
        };
    }
}
