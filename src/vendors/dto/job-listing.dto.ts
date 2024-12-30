import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class JobListingDto {
    @ApiProperty({ example: 1, description: 'Input Page' })
    @IsString()
    input_page: string;

    @ApiProperty({ example: '', description: 'Input Search', required: false })
    @IsOptional()
    @IsString()
    input_search: string;

    @ApiProperty({ example: false, description: 'Open Filter', required: false })
    @IsOptional()
    @IsString()
    open_filter: string;

    @ApiProperty({ example: false, description: 'Pending Filter', required: false })
    @IsOptional()
    @IsString()
    pending_filter: string;

    @ApiProperty({ example: false, description: 'Completed Filter', required: false })
    @IsOptional()
    @IsString()
    completed_filter: string;

    @ApiProperty({ example: '2024-11-18', description: 'Start Date', required: false })
    @IsOptional()
    @IsString()
    start_date: string;

    @ApiProperty({ example: '2024-11-25', description: 'End Date', required: false })
    @IsOptional()
    @IsString()
    end_date: string;

    @ApiProperty({ example: '', description: 'Service filter', required: false })
    @IsOptional()
    @IsString()
    service_filter: string;
}


export class PopularServiceListingDto {
    @ApiProperty({ example: '', description: 'Longitude', required: false })
    @IsOptional()
    @IsNumber()
    longitude: number;

    @ApiProperty({ example: '', description: 'Latitude', required: false})
    @IsOptional()
    @IsNumber()
    latitude: number;
}