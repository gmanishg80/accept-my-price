import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsEnum, IsEmail, IsOptional } from 'class-validator';


export class SocialLoginUserDto {
    @ApiProperty({ example: 'Aditya', description: 'First Name' })
    @IsNotEmpty()
    @IsString()
    first_name: string;
  
    @ApiProperty({ example: 'Gupta', description: 'Last Name' })
    @IsNotEmpty()
    @IsString()
    last_name: string;

    @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ example: '1dwr2342424232323', description: 'Google' })
    @IsOptional()
    @IsString()
    google_id: string;

    @ApiProperty({ example: '1dwr2342424232323', description: 'Apple' })
    @IsOptional()
    @IsString()
    apple_id: string;

    @ApiProperty({ example: 'google', description: 'Login Type' })
    @IsNotEmpty()
    @IsEnum(['email', 'google', 'apple'], { message: 'Login type must be either email, google, or apple.' })
    login_type: string;

    @ApiProperty({ example: 'vendor', description: 'User Type' })
    @IsNotEmpty()
    @IsEnum(['vendor', 'client'], { message: 'User type must be either client or vendor.' })
    user_type: string;

}
