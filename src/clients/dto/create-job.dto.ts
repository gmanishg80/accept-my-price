import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsBoolean, IsOptional, IsMongoId } from 'class-validator';

export class addressDto {
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
    @IsObject()
    country: string;

    @ApiProperty({ example: '', description: 'Longitude' })
    @IsOptional()
    @IsNumber()
    longitude: number
    
    @ApiProperty({ example: '', description: 'Latitude' })
    @IsOptional()
    @IsNumber()
    latitude: number
}

export class CreateJobDto {
    // @ApiProperty({ example: '21rse1313131dsf', description: 'Client User Id' })
    // @IsNotEmpty()
    // @IsString()
    // client_user_id: string;
  
    @ApiProperty({ example: 'AC repair', description: 'Job Name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'This is description', description: 'Description' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ example: '673c85f83d1721c20cc3c3df', description: 'Category Id' })
    @IsNotEmpty()
    @IsMongoId()
    category_id: string;

    @ApiProperty({ example: '1000', description: 'Budget' })
    @IsNotEmpty()
    @IsNumber()
    budget: number;

    @ApiProperty({ example: { street: 'Phase-5', city: 'Mohali', state: 'Punjab', zip: '1539005', country: 'India' }, description: '{street, city, state, zip, country}' })
    @IsOptional()
    @IsObject()
    address: addressDto;

    @ApiProperty({ example: 'current', description: 'Address Type' })
    @IsNotEmpty()
    @IsString()
    address_type: string;

    @ApiProperty({ example: 'hourly', description: 'Frequency' })
    @IsNotEmpty()
    @IsString()
    frequency: string;

    @ApiProperty({ example: 1797772290, description: 'Job Deadline' })
    @IsNotEmpty()
    @IsNumber()
    deadline: number

    @ApiProperty({ example: 300, description: 'Initial Pay Amount' })
    @IsOptional()
    @IsNumber()
    initial_pay_amt: number

    @ApiProperty({ example: '', description: 'Payment Method Id' })
    @IsOptional()
    @IsString()
    payment_method_id: string
    
    @ApiProperty({ example: '', description: 'Profile Image' })
    @IsOptional()
    @IsString()
    profile_img: string

    @ApiProperty({ example: 76.7179, description: 'Longitude' })
    @IsOptional()
    @IsNumber()
    longitude: number
    
    @ApiProperty({ example: 30.7046, description: 'Latitude' })
    @IsOptional()
    @IsNumber()
    latitude: number
}
