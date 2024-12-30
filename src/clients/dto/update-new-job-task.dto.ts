import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsMongoId, IsOptional, IsBoolean } from 'class-validator';

export class UpdateNewTaskDto {
    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsMongoId()
    job_id: string;

    @ApiProperty({ example: '', description: 'Task Id' })
    @IsNotEmpty()
    @IsMongoId()
    task_id: string;

    @ApiProperty({ example: '', description: 'Title' })
    @IsOptional()
    @IsString()
    title: string;

    @ApiProperty({ example: '', description: 'Description' })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ example: true, description: 'Requirement' })
    @IsNotEmpty()
    @IsBoolean()
    requirement_check: boolean;

    @ApiProperty({ example: '', description: 'Image' })
    @IsOptional()
    @IsString()
    image: string;
}
