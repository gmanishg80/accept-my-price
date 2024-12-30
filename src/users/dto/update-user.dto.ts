import { ApiProperty } from '@nestjs/swagger';
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


export class UpdateUserDto {
    @ApiProperty({ example: 'Aditya', description: 'First Name' })
    @IsOptional()
    @IsString()
    first_name: string;
  
    @ApiProperty({ example: 'Gupta', description: 'Last Name' })
    @IsOptional()
    @IsString()
    last_name: string;

    @ApiProperty({ example: '+1', description: 'Dial Code' })
    @IsOptional()
    @IsString()
    dial_code: string;

    @ApiProperty({ example: '9876543210', description: 'Phone Number' })
    @IsOptional()
    @IsString()
    phone_number: string;

    @ApiProperty({ example: { street: 'Phase-5', city: 'Mohali', state: 'Punjab', zip: '1539005', country: 'India' }, description: '{street, city, state, zip, country}' })
    @IsOptional()
    @IsObject()
    address: AddressDto;

    @ApiProperty({ example: '', description: 'Longitude' })
    @IsOptional()
    @IsNumber()
    longitude: number
    
    @ApiProperty({ example: '', description: 'Latitude' })
    @IsOptional()
    @IsNumber()
    latitude: number

    @ApiProperty({ example: '', description: 'Profile Image' })
    @IsOptional()
    @IsString()
    profile_img: string;
}
