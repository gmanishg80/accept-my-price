import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class InitialPaymentDto {

    @ApiProperty({ example: '', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;

    @ApiProperty({ example: '', description: 'Vendor User Id' })
    @IsNotEmpty()
    @IsString()
    vendor_user_id: string;

    // @ApiProperty({ example: '', description: 'Currency' })
    // @IsNotEmpty()
    // @IsString()
    // currency: string;

    @ApiProperty({ example: '', description: 'Amount' })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ example: '', description: 'Payment Method Id' })
    @IsOptional()
    @IsString()
    payment_method_id: string;

}
