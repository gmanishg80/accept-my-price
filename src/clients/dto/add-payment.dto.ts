import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject } from 'class-validator';

export class AddPaymentDto {
    @ApiProperty({ example: '3121bhhg2h3v3b232', description: 'Job Id' })
    @IsNotEmpty()
    @IsString()
    job_id: string;

    @ApiProperty({ example: 'pm_2fjwstf7321732', description: 'Paymnet Method Id' })
    @IsNotEmpty()
    @IsString()
    payment_method_id: string;

    @ApiProperty({ example: 600, description: 'Initial Pay Amount' })
    @IsNotEmpty()
    @IsNumber()
    initial_pay_amt: number;
}
