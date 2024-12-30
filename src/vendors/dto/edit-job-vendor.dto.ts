import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional, IsMongoId } from 'class-validator';

export class EditJobVendorDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsMongoId()
    job_id: string;

    // @ApiProperty({ example: '', description: 'Job Id' })
    // @IsNotEmpty()
    // @IsMongoId()
    // job_action_id: string;

    @ApiProperty({ example: '', description: 'Rating' })
    @IsNotEmpty()
    @IsNumber()
    deadline: number;

    @ApiProperty({ example: '', description: 'Comment' })
    @IsNotEmpty()
    @IsString()
    budget: string;

    @ApiProperty({ example: '', description: 'Frequency' })
    @IsNotEmpty()
    @IsString()
    frequency: string;

}
