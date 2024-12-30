import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsEnum, IsEmail, Length } from 'class-validator';


export class VerifyEmailDto {
    @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456', description: 'OTP' })
    @IsNotEmpty()    
    @IsString()
    @Length(6)
    otp: string;

}