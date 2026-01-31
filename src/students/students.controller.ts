import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    create(@Body(ValidationPipe) createStudentDto: CreateStudentDto) {
        return this.studentsService.create(createStudentDto);
    }

    @Get()
    findAll() {
        return this.studentsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.studentsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    update(@Param('id') id: string, @Body(ValidationPipe) updateStudentDto: UpdateStudentDto) {
        return this.studentsService.update(id, updateStudentDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.studentsService.remove(id);
    }
}
