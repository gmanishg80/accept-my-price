import { PartialType } from '@nestjs/mapped-types';
import { CreateVendorProfileDto } from './create-vendor-profile.dto';
import { IsOptional, IsString, IsNumber, IsNotEmpty, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class UpdateVendorProfileDto extends PartialType(CreateVendorProfileDto) {
    
    @ApiProperty({ example: 'AC Support', description: 'Bussiness Name' })
    @IsNotEmpty()
    @IsString()
    bussiness_name: string;

    @ApiProperty({ example: 'Lorium', description: 'Fein' })
    @IsNotEmpty()
    @IsString()
    fein: string;

    // @ApiProperty({ example: '', description: 'Services' })
    // @IsOptional()
    // @IsArray()
    // services: string;

}
