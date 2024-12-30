import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsEnum, IsEmail } from 'class-validator';


export class LoginUserDto {
    @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Abc@123', description: 'Password' })
    @IsNotEmpty()
    @IsString()
    password: string;

}
