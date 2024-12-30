import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional, IsMongoId } from 'class-validator';

export class UpdateQuantityDto {

    @ApiProperty({ example: '', description: 'Api Type' })
    @IsNotEmpty()
    @IsString()
    api_type: string;

    @ApiProperty({ example: '', description: 'Category Id' })
    @IsNotEmpty()
    @IsMongoId()
    category_id: string;

}
