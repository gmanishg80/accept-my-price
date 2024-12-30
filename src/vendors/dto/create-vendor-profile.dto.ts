import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsObject, IsArray, IsMongoId, ValidateNested } from 'class-validator';

class ServiceDto {
    @ApiProperty({ example: '', description: 'Category Id' })
    @IsNotEmpty()
    @IsMongoId()
    category_id: string;
  
    @ApiProperty({ example: 'Beauty', description: 'Category Name' })
    @IsNotEmpty()
    @IsString()
    category_name: string;
  }
  
export class CreateVendorProfileDto {
    // @ApiProperty({ example: 'g21h2j12323bv24', description: 'Vendor User Id' })
    // @IsNotEmpty()
    // @IsString()
    // vendor_user_id: string;

    @ApiProperty({ example: 'AC Support', description: 'Bussiness Name' })
    @IsNotEmpty()
    @IsString()
    bussiness_name: string;

    @ApiProperty({ example: 'Lorium', description: 'Fein' })
    @IsNotEmpty()
    @IsString()
    fein: string;

    @ApiProperty({ example: '', description: 'Category Id' })
    @IsNotEmpty()
    @IsMongoId()
    category_id: string;
  
    @ApiProperty({ example: '', description: 'Category Name' })
    @IsNotEmpty()
    @IsString()
    category_name: string;

    // @ApiProperty({
    //     type: [ServiceDto],  // Specifies the expected data type as an array of `ServiceDto`
    //     description: 'Array of service objects',  // Describes what this property represents
    //     example: [{ category_id: '', category_name: '' }],  // Example data for API documentation
    // })
    // @IsNotEmpty()  // Ensures that the `services` array is not empty
    // @IsArray()  // Ensures the `services` property is an array
    // @ValidateNested({ each: true })  // Validates each element in the array using the `ServiceDto` class
    // @Type(() => ServiceDto)  // Converts incoming plain objects into instances of `ServiceDto`
    // services: ServiceDto[];

    // @ApiProperty({ example: 'sub_hjh32j3g2', description: 'Subscription Id' })
    // @IsNotEmpty()
    // @IsObject()
    // subscription_id: string;

    // @ApiProperty({ example: 'Monthly', description: 'Subscription Plan Id' })
    // @IsNotEmpty()
    // @IsObject()
    // subscription_plan_id: string;

    // @ApiProperty({ example: 'www.stripe.com/connect', description: 'Stripe connect' })
    // @IsNotEmpty()
    // @IsObject()
    // stripe_connect_api: string;

    // @ApiProperty({ example: false, description: 'Status' })
    // @IsNotEmpty()
    // @IsObject()
    // subscription_status: string;
}

