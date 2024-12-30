import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class PayoutListingFilterDto {
    @ApiProperty({ example: 1, description: 'Input Page' })
    @IsString()
    input_page: string;

    @ApiProperty({ example: '', description: 'Amount', required: false })
    @IsOptional()
    @IsString()
    amount: string;

    @ApiProperty({ example: '2024-11-18', description: 'Start Date', required: false })
    @IsOptional()
    @IsString()
    date_filter: string;

    @ApiProperty({ example: '', description: 'Status', required: false })
    @IsOptional()
    @IsString()
    status_filter: string;
}
