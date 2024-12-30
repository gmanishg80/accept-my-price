import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsMongoId } from 'class-validator';

export class ServiceItemDto {
    @ApiProperty({ example: '', description: 'Service Item Id' })
    @IsNotEmpty()
    @IsString()
    item_id: string;

    // @ApiProperty({ example: '', description: 'Category Id' })
    // @IsNotEmpty()
    // @IsMongoId()
    // category_id: string;

    // @ApiProperty({ example: '', description: 'Category Name' })
    // @IsNotEmpty()
    // @IsString()
    // category_name: string;
}
