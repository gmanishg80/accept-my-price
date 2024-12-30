import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CancelJobVendorDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;

    @ApiProperty({ example: '', description: 'Rating' })
    @IsNotEmpty()
    @IsString()
    reason: number;

    @ApiProperty({ example: '', description: 'Comment' })
    @IsNotEmpty()
    @IsString()
    comment: string;

}
