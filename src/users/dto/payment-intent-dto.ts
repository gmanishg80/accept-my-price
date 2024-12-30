import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsEnum, IsEmail } from 'class-validator';


export class CreatePaymentIntentDto {
    @ApiProperty({ example: '', description: 'Payment Method Id' })
    @IsNotEmpty()
    @IsString()
    payment_method_id: string;

    // @ApiProperty({ example: 'Abc@123', description: 'Password' })
    // @IsNotEmpty()
    // @IsString()
    // currency: string;

    @ApiProperty({ example: 100, description: 'Amount' })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

}
