import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional, IsMongoId } from 'class-validator';

export class CancelJobClientDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsMongoId()
    job_id: string;

    // @ApiProperty({ example: '', description: 'Rating' })
    // @IsNotEmpty()
    // @IsString()
    // reason: number;

    // @ApiProperty({ example: '', description: 'Comment' })
    // @IsNotEmpty()
    // @IsString()
    // comment: string;

}
