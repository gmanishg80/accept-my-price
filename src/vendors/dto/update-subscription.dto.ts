import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsArray } from 'class-validator';

export class UpdateSubscriptionDto {
    @ApiProperty({ example: 'sub_21224nb', description: 'Subscription Id' })
    @IsNotEmpty()
    @IsString()
    subscription_id: string;

}

