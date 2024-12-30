import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class AddFeedbackVendorDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;

    @ApiProperty({ example: '', description: 'Vendor User Id' })
    @IsNotEmpty()
    @IsString()
    vendor_user_id: string;

    @ApiProperty({ example: '', description: 'Rating' })
    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @ApiProperty({ example: '', description: 'Comment' })
    @IsOptional()
    @IsString()
    comment: string;

}
