import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject } from 'class-validator';

export class AcceptJobDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;

    @ApiProperty({ example: '', description: 'Vendor User Id' })
    @IsNotEmpty()
    @IsString()
    vendor_user_id: string;

}
