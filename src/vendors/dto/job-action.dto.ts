import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsBoolean, IsOptional, IsMongoId } from 'class-validator';

export class JobActionDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsMongoId()
    job_id: string;

    @ApiProperty({ example: '', description: 'Action Type' })
    @IsNotEmpty()
    @IsString()
    action_type: string;

    @ApiProperty({ example: '', description: 'Is Insured' })
    @IsOptional()
    @IsBoolean()
    is_insured: boolean;

    @ApiProperty({ example: 100, description: 'insurance_amount' })
    @IsOptional()
    @IsNumber()
    insurance_amount: number;

    @ApiProperty({ example: 2, description: 'service_fee' })
    @IsOptional()
    @IsNumber()
    service_fee: number;

    @ApiProperty({ example: 112, description: 'total_payout_amount' })
    @IsOptional()
    @IsNumber()
    total_payout_amount: number;
}
