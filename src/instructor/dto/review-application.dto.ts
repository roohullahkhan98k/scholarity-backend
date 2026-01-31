import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class ReviewApplicationDto {
    @IsEnum(ApplicationStatus)
    status: ApplicationStatus;

    @IsOptional()
    @IsString()
    rejectionReason?: string;
}
