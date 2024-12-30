import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional, IsMongoId } from 'class-validator';

export class AddOnServiceDto {

    @ApiProperty({ example: '', description: 'Category Id' })
    @IsNotEmpty()
    @IsMongoId()
    category_id: string;

}
