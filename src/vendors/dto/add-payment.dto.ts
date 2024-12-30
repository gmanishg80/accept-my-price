import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject } from 'class-validator';

export class AddPaymentDto {

    @ApiProperty({ example: 'pm_2fjwstf7321732', description: 'Paymnet Method Id' })
    @IsNotEmpty()
    @IsString()
    payment_method_id: string;

    @ApiProperty({ example: 'stripe.com/connect', description: 'Stripe connect api' })
    @IsNotEmpty()
    @IsString()
    stripe_connect_api: string;
}
