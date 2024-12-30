import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ example: 'IT', description: 'Name' })
    @IsNotEmpty()
    @IsString()
    name: string;
}

export class CreateSubCategoryDto {
    @ApiProperty({ example: 'hj1223b2v3243h42', description: 'Category Id' })
    @IsNotEmpty()
    @IsString()
    category_id: string;

    @ApiProperty({ example: 'IT', description: 'Name' })
    @IsNotEmpty()
    @IsString()
    name: string;
}
