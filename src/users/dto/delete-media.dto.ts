import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsEnum, IsEmail } from 'class-validator';


export class DeleteMediaDto {
    @ApiProperty({ example: '', description: 'File URL' })
    @IsNotEmpty()
    @IsString()
    file_url: string;

}
