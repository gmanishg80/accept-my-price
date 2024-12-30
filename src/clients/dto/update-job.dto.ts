import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { IsOptional, IsString, IsNumber, IsNotEmpty, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    @IsNotEmpty()
    @IsNumber()
    longitude: number
    
    @ApiProperty({ example: '', description: 'Latitude' })
    @IsNotEmpty()
    @IsNumber()
    latitude: number
}

export class UpdateJobDto {
    @ApiProperty({ example: '21rse1313131dsf', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;
  
    @ApiProperty({ example: 'AC repair', description: 'Job Name' })
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty({ example: 'This is description', description: 'Description' })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ example: '42424223n3n23b2b42', description: 'Category Id' })
    @IsOptional()
    @IsString()
    category_id: string;

    @ApiProperty({ example: '1000', description: 'Budget' })
    @IsOptional()
    @IsNumber()
    budget: number;

    @ApiProperty({ example: { street: 'Phase-5', city: 'Mohali', state: 'Punjab', zip: '1539005', country: 'India' }, description: '{street, city, state, zip, country}' })
    @IsOptional()
    @IsObject()
    address: addressDto;

    @ApiProperty({ example: 'current', description: 'Address Type' })
    @IsOptional()
    @IsString()
    address_type: string;

    @ApiProperty({ example: 'hourly', description: 'Frequency' })
    @IsOptional()
    @IsString()
    frequency: string;

    @ApiProperty({ example: '12313133424', description: 'Job Date' })
    @IsOptional()
    @IsNumber()
    deadline: number

    @ApiProperty({ example: 300, description: 'Initial Pay Amount' })
    @IsOptional()
    @IsNumber()
    initial_pay_amt: number

    @ApiProperty({ example: '', description: 'Longitude' })
    @IsOptional()
    @IsNumber()
    longitude: number
    
    @ApiProperty({ example: '', description: 'Latitude' })
    @IsOptional()
    @IsNumber()
    latitude: number
 
}