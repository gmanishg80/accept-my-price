import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsEmail } from 'class-validator';

export class CreateSubscriptionDto {
    // @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
    // @IsNotEmpty()
    // @IsString()
    // @IsEmail()
    // email: string;
    
    // @ApiProperty({ example: 'pm_2fjwstf7321732', description: 'Paymnet Method Id' })
    // @IsNotEmpty()
    // @IsString()
    // payment_method_id: string;

    @ApiProperty({ example: 'price_1QKHPhCtaC1fmjOuIy6h38KR', description: 'Price Id' })
    @IsNotEmpty()
    @IsString()
    price_id: string;
}
