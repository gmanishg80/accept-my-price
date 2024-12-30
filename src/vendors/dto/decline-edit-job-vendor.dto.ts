import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class DeclineEditJobVendorDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;

    @ApiProperty({ example: '', description: 'Reason' })
    @IsNotEmpty()
    @IsString()
    reason: string;

    @ApiProperty({ example: '', description: 'Comment' })
    @IsNotEmpty()
    @IsString()
    comment: string;

}
