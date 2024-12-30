import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject } from 'class-validator';

export class JobDetailDto {
    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;
}
