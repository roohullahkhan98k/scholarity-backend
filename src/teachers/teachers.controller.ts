import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('teachers')
@UseGuards(JwtAuthGuard)
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    create(@Body(ValidationPipe) createTeacherDto: CreateTeacherDto) {
        return this.teachersService.create(createTeacherDto);
    }

    @Get()
    findAll() {
        return this.teachersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.teachersService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    update(@Param('id') id: string, @Body(ValidationPipe) updateTeacherDto: UpdateTeacherDto) {
        return this.teachersService.update(id, updateTeacherDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.teachersService.remove(id);
    }
}
