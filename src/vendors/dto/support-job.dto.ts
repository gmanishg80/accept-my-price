import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class SupportJobDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;

    // @ApiProperty({ example: '', description: 'Client User Id' })
    // @IsNotEmpty()
    // @IsString()
    // client_user_id: string;

    // @ApiProperty({ example: '', description: 'VEndor User Id' })
    // @IsNotEmpty()
    // @IsString()
    // vendor_user_id: string;

    @ApiProperty({ example: '', description: 'Message' })
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiProperty({ example: '', description: 'Select a problem' })
    @IsNotEmpty()
    @IsString()
    reason: string;

    // @ApiProperty({ example: '', description: 'Report' })
    // @IsNotEmpty()
    // @IsString()
    // type: string;

    // @ApiProperty({ example: '', description: 'Action Type' })
    // @IsNotEmpty()
    // @IsString()
    // status: string;
}

export class RefundRequestDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;

    // @ApiProperty({ example: '', description: 'Client User Id' })
    // @IsNotEmpty()
    // @IsString()
    // client_user_id: string;

    // @ApiProperty({ example: '', description: 'VEndor User Id' })
    // @IsNotEmpty()
    // @IsString()
    // vendor_user_id: string;

    @ApiProperty({ example: '', description: 'Message' })
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiProperty({ example: '', description: 'Select a problem' })
    @IsNotEmpty()
    @IsString()
    reason: string;

    @ApiProperty({ example: '', description: 'Sum of refund' })
    @IsNotEmpty()
    @IsNumber()
    refund_sum: number;

    // @ApiProperty({ example: '', description: 'Report' })
    // @IsNotEmpty()
    // @IsString()
    // type: string;

    // @ApiProperty({ example: '', description: 'Action Type' })
    // @IsNotEmpty()
    // @IsString()
    // status: string;
}

