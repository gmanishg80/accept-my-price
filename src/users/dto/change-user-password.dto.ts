import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsEnum, IsEmail } from 'class-validator';


export class ChangeUserPasswordDto {
    @ApiProperty({ example: 'Abc@123', description: 'Password' })
    @IsNotEmpty()
    @IsString()
    new_password: string;

}

export class ForgetUserPasswordDto {
    @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

}

export class ResetUserPasswordDto {
    @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Abc@123', description: 'Password' })
    @IsNotEmpty()
    @IsString()
    new_password: string;

}
