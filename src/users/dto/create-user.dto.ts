import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsEnum, IsEmail, IsOptional } from 'class-validator';

export class AddressDto {
    @ApiProperty({ example: 'Phase-5', description: 'Street' })
    @IsOptional()
    @IsString()
    street: string;

    @ApiProperty({ example: 'Mohali', description: 'City' })
    @IsNotEmpty()
    @IsString()
    city: string;

    @ApiProperty({ example: 'Punjab', description: 'State' })
    @IsNotEmpty()
    @IsString()
    state: string;

    @ApiProperty({ example: '1539005', description: 'ZIP' })
    @IsNotEmpty()
    @IsString()
    zip: string;

    @ApiProperty({ example: 'India', description: 'Country' })
    @IsNotEmpty()
    @IsString()  // Ensure this is a string for country name
    country: string;

    @ApiProperty({ example: '', description: 'Longitude' })
    @IsNotEmpty()
    @IsNumber()
    longitude: number
    
    @ApiProperty({ example: '', description: 'Latitude' })
    @IsNotEmpty()
    @IsNumber()
    latitude: number
}

// export enum UserType {
//     CLIENT = 'client',
//     VENDOR = 'vendor'
// }

// export enum LoginType {
//     PHONE = 'phone',
//     GOOGLE = 'google'
// }

export class CreateUserDto {
    @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Abc@123', description: 'Password' })
    @IsNotEmpty()
    @IsString()
    password: string;
    // @ApiProperty({ example: 'Aditya', description: 'First Name' })
    // @IsNotEmpty()
    // @IsString()
    // first_name: string;
  
    // @ApiProperty({ example: 'Gupta', description: 'Last Name' })
    // @IsNotEmpty()
    // @IsString()
    // last_name: string;

    // @ApiProperty({ example: '+1', description: 'Dial Code' })
    // @IsNotEmpty()
    // @IsString()
    // dial_code: string;

    // @ApiProperty({ example: '9876543210', description: 'Phone Number' })
    // @IsNotEmpty()
    // @IsString()
    // phone_number: string;

    // @ApiProperty({ example: { street: 'Phase-5', city: 'Mohali', state: 'Punjab', zip: '1539005', country: 'India' }, description: '{street, city, state, zip, country}' })
    // @IsNotEmpty()
    // @IsObject()
    // address: AddressDto;

    @ApiProperty({ example: 'email', description: 'Login Type' })
    @IsNotEmpty()
    @IsEnum(['email', 'google', 'apple'], { message: 'Login type must be either email, google, or apple.' })
    login_type: string;

    @ApiProperty({ example: 'client', description: 'User Type' })
    @IsNotEmpty()
    @IsEnum(['vendor', 'client'], { message: 'User type must be either client or vendor.' })
    user_type: string;

    // Additional properties
}
