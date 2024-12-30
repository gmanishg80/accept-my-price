import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CloseJobDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;

    @ApiProperty({ example: '', description: 'Rating' })
    @IsOptional()
    @IsNumber()
    rating: number;

    @ApiProperty({ example: '', description: 'Comment' })
    @IsOptional()
    @IsString()
    comment: string;

}
