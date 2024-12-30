import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class AddTeamMemberDto {
    @ApiProperty({ example: 'Aditya', description: 'First Name' })
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @ApiProperty({ example: 'Gupta', description: 'Last Name' })
    @IsNotEmpty()
    @IsString()
    last_name: string;

    @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    // @ApiProperty({ example: 'email', description: 'Login Type' })
    // @IsNotEmpty()
    // @IsEnum(['email', 'google', 'apple'], { message: 'Login type must be either email, google, or apple.' })
    // login_type: string;

    // @ApiProperty({ example: 'client', description: 'User Type' })
    // @IsNotEmpty()
    // @IsEnum(['vendor', 'client'], { message: 'User type must be either client or vendor.' })
    // user_type: string;

}

export class UpdateTeamMemberDto {
    @ApiProperty({ example: '', description: 'Team Member Id' })
    @IsNotEmpty()
    @IsString()
    team_member_id: string;

    @ApiProperty({ example: 'Aditya', description: 'First Name' })
    @IsString()
    first_name: string;
  
    @ApiProperty({ example: 'Gupta', description: 'Last Name' })
    @IsString()
    last_name: string;

    @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
    
    @ApiProperty({ example: '+1', description: 'Dial Code' })
    @IsNotEmpty()
    @IsString()
    dial_code: string;

    @ApiProperty({ example: '9876543210', description: 'Phone Number' })
    @IsNotEmpty()
    @IsString()
    phone_number: string;

}

export class DeleteTeamMemberDto {
    @ApiProperty({ example: '', description: 'Team Member Id' })
    @IsNotEmpty()
    @IsString()
    team_member_id: string;

}