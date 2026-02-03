import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class JoinInstructorDto {
    // User Account Details
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    // Instructor Application Details
    @IsString()
    @IsNotEmpty()
    bio!: string;

    @IsString()
    @IsNotEmpty()
    expertise!: string;

    @IsString()
    @IsNotEmpty()
    experience!: string;
}
