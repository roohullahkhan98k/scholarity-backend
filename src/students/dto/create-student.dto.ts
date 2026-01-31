import { IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    userId: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    interests?: string;
}
