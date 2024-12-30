import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req, HttpCode, Query, Res, Render, Redirect } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorProfileDto } from './dto/create-vendor-profile.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseError } from 'src/common/dto/response.dto';
import { ResponseMessage } from '../common/constants/message';
import { AddPaymentDto } from './dto/add-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { Response as ExpressResponse } from 'express';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JobListingDto, PopularServiceListingDto } from './dto/job-listing.dto';
import { AddTeamMemberDto, DeleteTeamMemberDto, UpdateTeamMemberDto } from './dto/add-team-member.dto';
import { OpenJobListingDto } from './dto/open-job-listing.dto';
import { JobActionDto } from './dto/job-action.dto';
import { AddFeedbackClientDto } from './dto/add-feedback-client.dto';
import { JobDetailDto } from './dto/job-detail.dto';
import { RefundRequestDto, SupportJobDto } from './dto/support-job.dto';
import { ServiceItemDto } from './dto/service-item.dto';
import { CloseJobDto } from './dto/close-job.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { CancelJobVendorDto } from './dto/cancel-job-vendor.dto';
import { EditJobVendorDto } from './dto/edit-job-vendor.dto';
import { DeclineEditJobVendorDto } from './dto/decline-edit-job-vendor.dto';
import { AddCommentVendorDto } from './dto/add-comment-vendor.dto';
import { AddOnServiceDto } from './dto/add-on-service.dto';
import { PayoutListingFilterDto } from './dto/payout-listing-filter.dto';

@ApiBearerAuth()
@ApiTags('Vendor Module')
@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post('create-vendor-subscription')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create subscription api' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreateSubscriptionDto })
  createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto, @Req() req: Request) {
    return this.vendorService.createVendorSubscription(createSubscriptionDto, req['currentUser']);
  }

  @Post('change-vendor-subscription')
  @HttpCode(200)
  @ApiOperation({ summary: 'Change subscription api' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreateSubscriptionDto })
  changeVendorSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto, @Req() req: Request) {
    return this.vendorService.changeVendorSubscription(createSubscriptionDto, req['currentUser']);
  }

  @Get('retrieve-vendor-subscription')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fetch subscription api' })
  @ApiResponse({ status: 201, description: 'Success.' })
  retrieveVendorSubscription(@Req() req: Request) {
    return this.vendorService.retrieveVendorSubscription(req['currentUser']);
  }

  // @Get('success-url')
  // @HttpCode(200)
  // @ApiOperation({ summary: '' })
  // @ApiResponse({ status: 201, description: 'Success.' })
  // @Render('checkoutSessionSuccess')
  // successUrl(@Query() queryParam: string, @Res() res: Response) {
  //   return this.vendorService.successUrl(queryParam['session_id']);
  // }

  // @Get('cancel-url')
  // @HttpCode(200)
  // @ApiOperation({ summary: '' })
  // @ApiResponse({ status: 201, description: 'Success.' })
  // // @Render('checkoutSessionCancel')
  // async cancelUrl(@Res() res: ExpressResponse) {
  //   const result = await this.vendorService.cancelUrl();
  //   if (result === true) {
  //     res.render('checkoutSessionSuccess')
  //   }
  //   else {
  //     res.render('somethingWentWrong')
  //   }
  // }

  @Patch('vendor-personal-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update vendor profile api' })
  @ApiResponse({ status: 201, description: 'Success.', type: UpdateVendorDto })
  updatePersonalInfo(@Body() updateVendorDto: UpdateVendorDto, @Req() req: Request) {
    return this.vendorService.updateVendorPersonalInfo(updateVendorDto, req['currentUser']);
  }

  @Post('vendor-bussiness-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create vendor bussiness api' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreateVendorProfileDto })
  updateBussinessInfo(@Body() createVendorProfileDto: CreateVendorProfileDto, @Req() req: Request) {
    return this.vendorService.updateVendorBussinessInfo(createVendorProfileDto, req['currentUser']);
  }

  @Get('vendor-profile-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Vendor profile api' })
  @ApiResponse({ status: 201, description: 'Success.'})
  vendorProfile(@Req() req: Request) {
    return this.vendorService.vendorProfileData(req['currentUser']);
  }

  @Post('update-subscription-data')
  @HttpCode(200)
  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 201, description: 'Success.', type: UpdateSubscriptionDto })
  updateSubscriptionData(@Body() updateSubscriptionDto: UpdateSubscriptionDto, @Req() req: Request) {
    return this.vendorService.updateSubscriptionData(updateSubscriptionDto, req['currentUser']);
  }

  @Post('create-connect-account')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create stripe connect api' })
  @ApiResponse({ status: 201, description: 'Success.'})
  connectAccount(@Req() req: Request) {
    return this.vendorService.createConnectAccount(req['currentUser']);
  }

  @Get('refresh-url/:user_id')
  @HttpCode(200)
  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 201, description: 'Success.' })
  @Redirect()
  async refreshUrl(@Param('user_id') user_id: string) {
    const result = await this.vendorService.refreshURL(user_id);

    if (typeof result === 'string') {
      // Redirect to the Stripe account link URL
      return { url: result };
    } else {
      // Handle error response if the profile or Stripe account link creation failed
      return new ResponseError(ResponseMessage.SOMETHING_WENT_WRONG, null, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('return-url/:user_id')
@Redirect()
async returnUrl(@Param('user_id') user_id: string) {
    const result = await this.vendorService.returnURL(user_id);

    // Check if result has an `url` property
    if ('url' in result) {
        return result; // This will redirect to the URL in `result.url`
    } else {
      return new ResponseError(ResponseMessage.SOMETHING_WENT_WRONG, null, HttpStatus.BAD_REQUEST);
    }
}

  @Get('vendor-home-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Vendor homepage data api' })
  @ApiResponse({ status: 201, description: 'Success.' })
  clientHomeData(@Req() req: Request) {
    return this.vendorService.vendorHomeData(req['currentUser']);
  }
  
  @Get('vendor-job-listing-and-filter')
  @HttpCode(200)
  @ApiOperation({ summary: 'Vendor job listing and filter api' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobListingDto })
  jobListingAndFilter(@Query() jobListingDto: JobListingDto, @Req() req: Request) {
    return this.vendorService.vendorJobListingAndFilter(jobListingDto, req['currentUser']);
  }
  
  @Post('add-team-member')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add team member api' })
  @ApiResponse({ status: 201, description: 'Success.', type: AddTeamMemberDto })
  addTeamMember(@Body() addTeamMemberDto: AddTeamMemberDto, @Req() req: Request) {
    return this.vendorService.addTeamMember(addTeamMemberDto, req['currentUser']);
  }

  @Get('list-team-member')
  @HttpCode(200)
  @ApiOperation({ summary: 'List team member' })
  @ApiResponse({ status: 201, description: 'Success.' })
  listTeamMember(@Req() req: Request) {
    return this.vendorService.listTeamMember(req['currentUser']);
  }
  
  @Post('update-team-member')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update team member api' })
  @ApiResponse({ status: 201, description: 'Success.', type: UpdateTeamMemberDto })
  updateTeamMember(@Body() updateTeamMemberDto: UpdateTeamMemberDto, @Req() req: Request) {
    return this.vendorService.updateTeamMember(updateTeamMemberDto, req['currentUser']);
  }

  @Delete('delete-team-member')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete team member api' })
  @ApiResponse({ status: 201, description: 'Success.', type: DeleteTeamMemberDto })
  deleteTeamMember(@Query() deleteTeamMemberDto: DeleteTeamMemberDto, @Req() req: Request) {
    return this.vendorService.deleteTeamMember(deleteTeamMemberDto, req['currentUser']);
  }

  @Get('vendor-open-jobs-listing-filter')
  @HttpCode(200)
  @ApiOperation({ summary: 'Open jobs listing and filter' })
  @ApiResponse({ status: 201, description: 'Success.', type: OpenJobListingDto, })
  vendorOpenJobListingAndFilter(@Query() openJobListingDto: OpenJobListingDto, @Req() req: Request) {
    return this.vendorService.vendorOpenJobListingAndFilter(openJobListingDto, req['currentUser']);
  }

  @Post('vendor-action-job')
  @HttpCode(200)
  @ApiOperation({ summary: 'Vendor action on job' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobActionDto, })
  vendorActionOnJob(@Body() jobActionDto: JobActionDto, @Req() req: Request) {
    return this.vendorService.vendorActionOnJob(jobActionDto, req['currentUser']);
  }

  @Get('popular-service-home')
  @HttpCode(200)
  @ApiOperation({ summary: 'Popular jobs homepage' })
  @ApiResponse({ status: 201, description: 'Success.', type: PopularServiceListingDto })
  popularServicesHome(@Query() popularServiceListingDto: PopularServiceListingDto, @Req() req: Request) {
    return this.vendorService.popularServicesHome(popularServiceListingDto);
  }

  @Post('add-feedback-client')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add feedback to client' })
  @ApiResponse({ status: 201, description: 'Success.', type: AddFeedbackClientDto })
  addFeedback(@Body() addFeedbackClientDto: AddFeedbackClientDto, @Req() req: Request) {
    return this.vendorService.addFeedback(addFeedbackClientDto, req['currentUser']);
  }

  @Get('job-detail-vendor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Vendor job listing api' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobDetailDto })
  jobDetailVendorSide(@Query() jobDetailDto: JobDetailDto, @Req() req: Request) {
    return this.vendorService.jobDetailVendorSide(jobDetailDto, req['currentUser']);
  }

  @Post('test-stripe')
  @HttpCode(200)
  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 201, description: 'Success.' })
  testStripe() {
    return this.vendorService.testStripe();
  }

  @Post('create-account')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe connect account' })
  @ApiResponse({ status: 201, description: 'Success.' })
  createAccount(@Req() req: Request) {
    return this.vendorService.createAccount(req['currentUser']);
  }

  @Get('retrieve-account-verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Retrieve account and verify api' })
  @ApiResponse({ status: 201, description: 'Success.' })
  retrieveAccountAndVerify(@Req() req: Request) {
    return this.vendorService.retrieveAccountAndVerify(req['currentUser']);
  }

  @Post('account-session')
  @HttpCode(200)
  @ApiOperation({ summary: 'Account session for connect account' })
  @ApiResponse({ status: 201, description: 'Success.' })
  createAccountSession(@Req() req: Request) {
    return this.vendorService.createAccountSession(req['currentUser']);
  }
  
  @Get('billing-history-vendor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Billing history api vendor side' })
  @ApiResponse({ status: 201, description: 'Success.' })
  billingHistory(@Req() req: Request) {
    return this.vendorService.billingHistoryVendor(req['currentUser']);
  }

  @Post('vendor-issue')
  @HttpCode(200)
  @ApiOperation({ summary: 'Customer issue job client side' })
  @ApiResponse({ status: 201, description: 'Success.', type: SupportJobDto })
  vendorIssue(@Body() supportJobDto: SupportJobDto, @Req() req: Request) {
    return this.vendorService.vendorIssue(supportJobDto, req['currentUser']);
  }

  @Patch('close-job')
  @HttpCode(200)
  @ApiOperation({ summary: 'Close job' })
  @ApiResponse({ status: 201, description: 'Success.', type: CloseJobDto })
  closeJob(@Body() closeJobDto: CloseJobDto, @Req() req: Request) {
    return this.vendorService.closeJob(closeJobDto, req['currentUser']);
  }

  @Post('enable-service')
  @HttpCode(200)
  @ApiOperation({ summary: 'Enable add-on service' })
  @ApiResponse({ status: 201, description: 'Success.', type: AddOnServiceDto })
  enableAddOnService(@Body() addOnServiceDto: AddOnServiceDto, @Req() req: Request) {
    return this.vendorService.enableAddOnService(addOnServiceDto, req['currentUser']);
  }

  // @Post('cancel-service')
  // @HttpCode(200)
  // @ApiOperation({ summary: 'Cancel add-on service' })
  // @ApiResponse({ status: 201, description: 'Success.', type: ServiceItemDto })
  // cancelAddOnService(serviceItemDto: ServiceItemDto, @Req() req: Request) {
  //   return this.vendorService.cancelAddOnService(serviceItemDto, req['currentUser']);
  // }

  @Get('vendor-own-category-list')
  @HttpCode(200)
  @ApiOperation({ summary: 'Vendor own category listing' })
  @ApiResponse({ status: 201, description: 'Success.' })
  vendorOwnCategoryList(@Req() req: Request) {
    return this.vendorService.vendorOwnCategoryList(req['currentUser']);
  }

  @Patch('update-quantity')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update quantity' })
  @ApiResponse({ status: 201, description: 'Success.', type: UpdateQuantityDto })
  updateQuantity(@Body() updateQuantityDto: UpdateQuantityDto, @Req() req: Request) {
    return this.vendorService.updateQuantity(updateQuantityDto, req['currentUser']);
  }

  @Get('vendor-added-service-listing')
  @HttpCode(200)
  @ApiOperation({ summary: 'Vendor added service listing' })
  @ApiResponse({ status: 201, description: 'Success.' })
  vendorAddedServiceListing(@Req() req: Request) {
    return this.vendorService.vendorAddedServiceListing(req['currentUser']);
  }

  @Patch('cancel-job-vendor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel job vendor side' })
  @ApiResponse({ status: 201, description: 'Success.', type: CancelJobVendorDto })
  cancelJobVendor(@Body() cancelJobVendorDto: CancelJobVendorDto, @Req() req: Request) {
    return this.vendorService.cancelJobVendor(cancelJobVendorDto, req['currentUser']);
  }

  @Post('add-team-member-service')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add team member service' })
  @ApiResponse({ status: 201, description: 'Success.', type: UpdateQuantityDto })
  addTeamMemberService(@Req() req: Request) {
    return this.vendorService.addTeamMemberService(req['currentUser']);
  }

  @Patch('add-team-update-quantity')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update team member quantity' })
  @ApiResponse({ status: 201, description: 'Success.' })
  addTeamUpdateQuantity(@Req() req: Request) {
    return this.vendorService.addTeamUpdateQuantity(req['currentUser']);
  }

  @Patch('edit-job-vendor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Edit job from vendor side' })
  @ApiResponse({ status: 201, description: 'Success.', type: EditJobVendorDto })
  editJobVendorSide(@Body() editJobVendorDto: EditJobVendorDto, @Req() req: Request) {
    return this.vendorService.editJobVendorSide(editJobVendorDto, req['currentUser']);
  }

  @Patch('approve-edit-job-vendor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Approve edit job if client has made any changes' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobDetailDto })
  approveEditJobVendorSide(@Body() jobDetailDto: JobDetailDto, @Req() req: Request) {
    return this.vendorService.approveEditJobVendorSide(jobDetailDto, req['currentUser']);
  }

  @Patch('decline-edit-job-vendor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Approve edit job if client has made any changes' })
  @ApiResponse({ status: 201, description: 'Success.', type: DeclineEditJobVendorDto })
  declineEditJobVendorSide(@Body() declineEditJobVendorDto: DeclineEditJobVendorDto, @Req() req: Request) {
    return this.vendorService.declineEditJobVendorSide(declineEditJobVendorDto, req['currentUser']);
  }

  @Post('add-comment-vendor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add comment for task by vendor' })
  @ApiResponse({ status: 201, description: 'Success.', type: AddCommentVendorDto })
  addCommentClient(@Body() addCommentVendorDto: AddCommentVendorDto, @Req() req: Request) {
    return this.vendorService.addCommentClient(addCommentVendorDto, req['currentUser']);
  }

  @Get('revenue-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revenue data vendor side' })
  @ApiResponse({ status: 201, description: 'Success.' })
  revenueData(@Req() req: Request) {
    return this.vendorService.revenueData(req['currentUser']);
  }

  @Get('payout-listing-filter')
  @HttpCode(200)
  @ApiOperation({ summary: 'Payout listing and filter' })
  @ApiResponse({ status: 201, description: 'Success.', type: PayoutListingFilterDto, })
  payoutListingAndFilter(@Query() payoutListingFilterDto: PayoutListingFilterDto, @Req() req: Request) {
    return this.vendorService.payoutListingAndFilter(payoutListingFilterDto, req['currentUser']);
  }
}
