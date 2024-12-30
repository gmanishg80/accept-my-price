import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsEnum, IsEmail, IsBoolean, IsOptional } from 'class-validator';


export class NotificationPreferenceDto {
    @ApiProperty({ example: true, description: 'Email Notification' })
    @IsOptional()
    @IsBoolean()
    email_notification: boolean;

    @ApiProperty({ example: true, description: 'Phone Notification' })
    @IsOptional()
    @IsBoolean()
    phone_notification: boolean;

}

// export class SetDefaultCardDto {
//     @ApiProperty({ example: '', description: 'Payment Method Id' })
//     @IsNotEmpty()
//     @IsString()
//     payment_method_id: string;
// }
