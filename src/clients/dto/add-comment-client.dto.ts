import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsMongoId, IsOptional } from 'class-validator';

export class AddCommentClientDto {
    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsMongoId()
    job_id: string;

    @ApiProperty({ example: '', description: 'Task Id' })
    @IsNotEmpty()
    @IsMongoId()
    task_id: string;

    @ApiProperty({ example: '', description: 'Message' })
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiProperty({ example: '', description: 'Image' })
    @IsOptional()
    @IsString()
    image: string;
}
