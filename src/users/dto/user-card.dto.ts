import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsEnum, IsEmail } from 'class-validator';

export class UserCardDto {
    @ApiProperty({ example: '', description: 'Payment Method Id' })
    @IsNotEmpty()
    @IsString()
    payment_method_id: string;

}

// export class SetDefaultCardDto {
//     @ApiProperty({ example: '', description: 'Payment Method Id' })
//     @IsNotEmpty()
//     @IsString()
//     payment_method_id: string;
// }
