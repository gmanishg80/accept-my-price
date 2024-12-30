import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class OpenJobListingDto {
    @ApiProperty({ example: 1, description: 'Input Page' })
    @IsString()
    input_page: string;

    @ApiProperty({ example: '', description: 'Input Search', required: false })
    @IsOptional()
    @IsString()
    input_search: string;

    @ApiProperty({ example: false, description: 'Distance Filter', required: false })
    @IsOptional()
    // @IsArray()
    distance_filter: number[];

    @ApiProperty({ example: '', description: 'Start Amount', required: false })
    @IsOptional()
    @IsString()
    start_amount: string;

    @ApiProperty({ example: '', description: 'End Amount', required: false })
    @IsOptional()
    @IsString()
    end_amount: string;

    @ApiProperty({ example: '2024-11-18', description: 'Start Date', required: false })
    @IsOptional()
    @IsString()
    start_date: string;

    @ApiProperty({ example: '2024-11-25', description: 'End Date', required: false })
    @IsOptional()
    @IsString()
    end_date: string;

    // @ApiProperty({ example: '', description: 'Longitude', required: false })
    // @IsOptional()
    // @IsString()
    // longitude: string;

    // @ApiProperty({ example: '', description: 'Latitude', required: false})
    // @IsOptional()
    // @IsString()
    // latitude: string;

    @ApiProperty({ example: '', description: 'Service filter', required: false })
    @IsOptional()
    @IsString()
    service_filter: string;
}
