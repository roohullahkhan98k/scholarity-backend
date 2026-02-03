import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateTeacherDto {
    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    expertise?: string;

    @IsOptional()
    @IsString()
    experience?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    totalStudents?: number;
}
