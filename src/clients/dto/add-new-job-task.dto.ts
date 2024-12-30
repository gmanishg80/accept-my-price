import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsMongoId, IsOptional, IsBoolean } from 'class-validator';

export class AddNewTaskDto {
    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsMongoId()
    job_id: string;

    @ApiProperty({ example: '', description: 'Title' })
    @IsNotEmpty()
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
