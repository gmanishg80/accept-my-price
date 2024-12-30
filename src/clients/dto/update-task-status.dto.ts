import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsMongoId, IsOptional } from 'class-validator';

export class TaskCommonDto {
    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsMongoId()
    job_id: string;

    @ApiProperty({ example: '', description: 'Task Id' })
    @IsNotEmpty()
    @IsMongoId()
    task_id: string;
}
