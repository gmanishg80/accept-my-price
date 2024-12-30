import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req, HttpCode, Res, Query, RawBodyRequest } from '@nestjs/common';
import { UserService } from './user.service';
// import { Request, Response } from "express";
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseError } from 'src/common/dto/response.dto';
import { ResponseMessage } from '../common/constants/message';
import { LoginUserDto } from './dto/login-user.dto';
import { SocialLoginUserDto } from './dto/social-login-user.dto';
import { ChangeUserPasswordDto, ForgetUserPasswordDto, ResetUserPasswordDto , } from './dto/change-user-password.dto';
import { VerifyEmailDto } from './dto/verify-user-email.dto';
import { UserCardDto } from './dto/user-card.dto';
import { NotificationPreferenceDto } from './dto/notification-preference.dto';
import { CreatePaymentIntentDto } from './dto/payment-intent-dto';
import { DeleteMediaDto } from './dto/delete-media.dto';

@ApiBearerAuth()
@ApiTags('User Module')
@Controller('user')
export class UserController {
  // private name;
  constructor(private readonly usersService: UserService) {
  // this.name = "aditya"
  }

  @Get('ping-me')
  @ApiOperation({ summary: 'Server ping api' })
  @ApiResponse({ status: 201, description: 'Success.' })
  pingMe() {
    return this.usersService.pingMe();
  }

  @Post('sign-up')
  @HttpCode(200)
  @ApiOperation({ summary: 'User registration api' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreateUserDto })
  signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.userSignUp(createUserDto);
  }

  @Post('verify-email-otp')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify email otp api' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreateUserDto })
  verifyOtp(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.usersService.verifyEmailOtp(verifyEmailDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login api' })
  @ApiResponse({ status: 201, description: 'Success.', type: LoginUserDto })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.userLogIn(loginUserDto);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'User logout api' })
  @ApiResponse({ status: 201, description: 'Success.' })
  logout(@Req() req: Request) {
    return this.usersService.userLogOut(req['headers']);
  }

  @Post('social-login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User social login api' })
  @ApiResponse({ status: 201, description: 'Success.', type: SocialLoginUserDto })
  socialLogin(@Body() socialLoginUserDto: SocialLoginUserDto) {
    return this.usersService.userSocialLogIn(socialLoginUserDto);
  }

  @Get('user-profile-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'User profile data api' })
  @ApiResponse({ status: 201, description: 'Success.' })
  userDetail(@Req() req: Request) {
    return this.usersService.userProfileData(req['currentUser']);
  }

  @Patch('change-user-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Change user password api' })
  @ApiResponse({ status: 201, description: 'Success.', type: ChangeUserPasswordDto })
  changePassword(@Body() changeUserPasswordDto: ChangeUserPasswordDto, @Req() req: Request) {
    return this.usersService.changeUserPassword(changeUserPasswordDto, req['currentUser']);
  }
  
  @Post('forget-user-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Forget user password api' })
  @ApiResponse({ status: 201, description: 'Success.', type: ForgetUserPasswordDto })
  forgetPassword(@Body() forgetUserPasswordDto: ForgetUserPasswordDto) {
    return this.usersService.forgetUserPassword(forgetUserPasswordDto);
  }

  @Post('resend-email-otp')
  @HttpCode(200)
  @ApiOperation({ summary: 'Resend Otp api' })
  @ApiResponse({ status: 201, description: 'Success.', type: ForgetUserPasswordDto })
  resentOtp(@Body() forgetUserPasswordDto: ForgetUserPasswordDto) {
    return this.usersService.resendEmailOtp(forgetUserPasswordDto);
  }

  @Patch('reset-user-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset user password api' })
  @ApiResponse({ status: 201, description: 'Success.', type: ResetUserPasswordDto })
  resetPassword(@Body() resetUserPasswordDto: ResetUserPasswordDto) {
    return this.usersService.resetUserPassword(resetUserPasswordDto);
  }

  @Post('upload-media')
  @HttpCode(200)
  @ApiOperation({ summary: 'Upload image or video' })
  @ApiResponse({ status: 201, description: 'Success.' })
  uploadMedia(@Body() req: Request) {
    return this.usersService.uploadMedia(req['files']);
  }

  @Delete('delete-media')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete image or video' })
  @ApiResponse({ status: 201, description: 'Success.', type: DeleteMediaDto })
  upload(@Query() deleteMediaDto: DeleteMediaDto) {
    return this.usersService.deleteMedia(deleteMediaDto);
  }

  @Patch('update-profile-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 201, description: 'Success.', type: UpdateUserDto })
  updateProfileData(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    return this.usersService.updateProfileData(updateUserDto, req['currentUser']);
  }

  @Post('add-card')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add card' })
  @ApiResponse({ status: 201, description: 'Success.', type: UserCardDto })
  addCard(@Body() userCardDto: UserCardDto, @Req() req: Request) {
    return this.usersService.addCard(userCardDto, req['currentUser']);
  }

  @Get('list-card')
  @HttpCode(200)
  @ApiOperation({ summary: 'List card' })
  @ApiResponse({ status: 201, description: 'Success.', type: UserCardDto })
  listCard(@Req() req: Request) {
    return this.usersService.listCard(req['currentUser']);
  }

  @Post('delete-card')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete card' })
  @ApiResponse({ status: 201, description: 'Success.', type: UserCardDto })
  deleteCard(@Body() userCardDto: UserCardDto, @Req() req: Request) {
    return this.usersService.deleteCard(userCardDto, req['currentUser']);
  }

  @Post('set-default-card')
  @HttpCode(200)
  @ApiOperation({ summary: 'Set default card' })
  @ApiResponse({ status: 201, description: 'Success.', type: UserCardDto })
  defaultCard(@Body() userCardDto: UserCardDto, @Req() req: Request) {
    return this.usersService.setDefaultCard(userCardDto, req['currentUser']);
  }

  @Get('retrieve-payment-method')
  @HttpCode(200)
  @ApiOperation({ summary: 'Retrieve payement method' })
  @ApiResponse({ status: 201, description: 'Success.', type: UserCardDto })
  retrievePaymentMethod(@Query() userCardDto: UserCardDto, @Req() req: Request) {
    return this.usersService.retrievePaymentMethod(userCardDto, req['currentUser']);
  }

  @Patch('update-notification-preference')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update notification preference' })
  @ApiResponse({ status: 201, description: 'Success.', type: NotificationPreferenceDto })
  notificationPreference(@Body() notificationPreferenceDto: NotificationPreferenceDto, @Req() req: Request) {
    return this.usersService.updateNotificationPreference(notificationPreferenceDto, req['currentUser']);
  }

  @Get('update-skip-status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update skip status' })
  @ApiResponse({ status: 201, description: 'Success.' })
  updateSkipStatus(@Req() req: Request) {
    return this.usersService.updateSkipStatus(req['currentUser']);
  }

  @Post('create-payment-intent')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreatePaymentIntentDto })
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto, @Req() req: Request) {
    return this.usersService.createPaymentIntent(createPaymentIntentDto, req['currentUser']);
  }

  // @Post('confirm-payment-intent')
  // @HttpCode(200)
  // @ApiOperation({ summary: 'Create payment intent' })
  // @ApiResponse({ status: 201, description: 'Success.' })
  // confirmPaymentIntentWebhook(@Body() bodyData: any, @Req() req: Request) {
  //   return this.usersService.confirmPaymentIntentWebhook(bodyData, req['headers']);
  // }


  @Post('confirm-payment-intent')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 201, description: 'Success.' })
  confirmPaymentIntentWebhook(@Req() req: RawBodyRequest<Request> , @Res() res ) {
    res.status(200)
    console.log(req?.body,'--------------------------', req?.url)
    return this.usersService.confirmPaymentIntentWebhook(req['body'], req['headers']);
  }



//   @Get('get-user/:id')
//   findOne(@Param('id') id: string) {
//     return this.usersService.findOne(id);
//   }

//   @Patch('update-user/:id')
//   update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
//     return this.usersService.update(id, updateUserDto);
//   }

//   @Delete('delete-user/:id')
//   remove(@Param('id') id: string) {
//     return this.usersService.remove(id);
//   }
}
