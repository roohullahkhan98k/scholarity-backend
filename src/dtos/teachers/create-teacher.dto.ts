import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateTeacherDto {
    @IsString()
    userId: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    expertise?: string;

    @IsOptional()
    @IsString()
    experience?: string;
}
