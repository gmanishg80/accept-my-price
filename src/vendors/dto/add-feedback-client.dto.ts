import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class AddFeedbackClientDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;

    @ApiProperty({ example: '', description: 'Client User Id' })
    @IsNotEmpty()
    @IsString()
    client_user_id: string;

    @ApiProperty({ example: '', description: 'Rating' })
    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @ApiProperty({ example: '', description: 'Rating' })
    @IsOptional()
    @IsString()
    comment: string;

}
