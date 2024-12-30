import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject } from 'class-validator';

export class AiCategoryDto {

    @ApiProperty({ example: '', description: 'Input' })
    @IsNotEmpty()
    @IsString()
    input: string;

}
