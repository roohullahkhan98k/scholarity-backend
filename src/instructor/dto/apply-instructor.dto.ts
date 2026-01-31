import { IsString, MinLength } from 'class-validator';

export class ApplyInstructorDto {
    @IsString()
    @MinLength(50)
    bio: string;

    @IsString()
    @MinLength(10)
    expertise: string;

    @IsString()
    @MinLength(50)
    experience: string;
}
