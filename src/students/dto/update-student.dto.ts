import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateStudentDto {
    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    interests?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    enrolledCourses?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    completedCourses?: number;
}
