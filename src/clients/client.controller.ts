import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req, HttpCode, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseError } from 'src/common/dto/response.dto';
import { ResponseMessage } from '../common/constants/message';
import { AddPaymentDto } from './dto/add-payment.dto';
import { JobListingDto, PopularJobListingDto } from './dto/job-listing.dto';
import { JobDetailDto } from './dto/job-detail.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiJobApiDto } from './dto/ai-job-api.dto';
import { AcceptJobDto } from './dto/accept-job.dto';
import { AddFeedbackVendorDto } from './dto/add-feedback-vendor.dto';
import { InitialPaymentDto } from './dto/initial-payment.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { RefundRequestDto, SupportJobDto } from './dto/support-job.dto';
import { CloseJobDto } from './dto/close-job.dto';
import { EditJobClientDto } from './dto/edit-job-client.dto';
import { DeclineEditJobClientDto } from './dto/decline-edit-job-client.dto';
import { AddNewTaskDto } from './dto/add-new-job-task.dto';
import { AddCommentClientDto } from './dto/add-comment-client.dto';
import { TaskCommonDto } from './dto/update-task-status.dto';
import { UpdateNewTaskDto } from './dto/update-new-job-task.dto';
import { CancelJobClientDto } from './dto/cancel-job-client.dto';


@ApiBearerAuth()
@ApiTags('Client Module')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('create-job')
  @HttpCode(200)
  @ApiOperation({ summary: 'Job create api' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreateJobDto })
  createJobProfile(@Body() createJobDto: CreateJobDto, @Req() req: Request) {
    return this.clientService.createJob(createJobDto, req['currentUser']);
  }

  @Patch('client-personal-info')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update client profile api' })
  @ApiResponse({ status: 201, description: 'Success.', type: UpdateClientDto })
  updatePersonalInfo(@Body() updateClientDto: UpdateClientDto, @Req() req: Request) {
    return this.clientService.updateClientPersonalInfo(updateClientDto, req['currentUser']);
  }

  @Post('add-client-payment')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add payment method api' })
  @ApiResponse({ status: 201, description: 'Success.', type: AddPaymentDto })
  addPayment(@Body() addPaymentDto: AddPaymentDto, @Req() req: Request) {
    return this.clientService.addClientPayment(addPaymentDto, req['currentUser']);
  }

  @Get('client-home-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Client homepage data api' })
  @ApiResponse({ status: 201, description: 'Success.' })
  clientHomeData(@Req() req: Request) {
    return this.clientService.clientHomeData(req['currentUser']);
  }

  @Get('client-job-listing-and-filter')
  @HttpCode(200)
  @ApiOperation({ summary: 'Client job listing and filter api' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobListingDto })
  jobListingAndFilter(@Query() jobListingDto: JobListingDto, @Req() req: Request) {
    return this.clientService.clientJobListingAndFilter(jobListingDto, req['currentUser']);
  }

  @Patch('update-job')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update job data api' })
  @ApiResponse({ status: 201, description: 'Success.', type: UpdateJobDto })
  updateJob(@Body() updateJobDto: UpdateJobDto, @Req() req: Request) {
    return this.clientService.updateJob(updateJobDto, req['currentUser']);
  }

  @Get('job-detail-client')
  @HttpCode(200)
  @ApiOperation({ summary: 'Client job listing api' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobDetailDto })
  jobDetailClientSide(@Query() jobDetailDto: JobDetailDto, @Req() req: Request) {
    return this.clientService.jobDetailClientSide(jobDetailDto, req['currentUser']);
  }

  @Post('add-new-job')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add new job api' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreateJobDto })
  addNewJob(@Body() createJobDto: CreateJobDto, @Req() req: Request) {
    return this.clientService.addNewJob(createJobDto, req['currentUser']);
  }

  @Get('popular-job-home')
  @HttpCode(200)
  @ApiOperation({ summary: 'Popular jobs homepage' })
  @ApiResponse({ status: 201, description: 'Success.', type: PopularJobListingDto })
  popularJobsHome(@Query() popularJobListingDto: PopularJobListingDto, @Req() req: Request) {
    return this.clientService.popularJobsHome(popularJobListingDto, req['currentUser']);
  }

  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data') // Inform Swagger this endpoint consumes form-data
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new Error('No file uploaded');
    }
    const url = await this.clientService.uploadFile(file);
    return { url };
  }

  @Get('ai-generate-job-name')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generate job name api' })
  @ApiResponse({ status: 201, description: 'Success.', type: AiJobApiDto })
  generateJobName(@Query() aiJobApiDto: AiJobApiDto) {
    return this.clientService.generateJobName(aiJobApiDto);
  }

  @Post('accept-vendor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Approve vendor for job api' })
  @ApiResponse({ status: 201, description: 'Success.', type: AcceptJobDto })
  acceptVendor(@Body() acceptJobDto: AcceptJobDto, @Req() req: Request) {
    return this.clientService.acceptVendor(acceptJobDto, req['currentUser']);
  }

  @Get('job-vendor-listing')
  @HttpCode(200)
  @ApiOperation({ summary: 'Job vendor listing' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobDetailDto })
  jobVendorListing(@Query() jobDetailDto: JobDetailDto, @Req() req: Request) {
    return this.clientService.jobVendorListing(jobDetailDto, req['currentUser']);
  }

  @Post('add-feedback-vendor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add feedback to vendor' })
  @ApiResponse({ status: 201, description: 'Success.', type: AddFeedbackVendorDto })
  addFeedback(@Body() addFeedbackDto: AddFeedbackVendorDto, @Req() req: Request) {
    return this.clientService.addFeedback(addFeedbackDto, req['currentUser']);
  }

  @Post('make-initial-payment')
  @HttpCode(200)
  @ApiOperation({ summary: 'Make initial payment to vendor' })
  @ApiResponse({ status: 201, description: 'Success.', type: InitialPaymentDto })
  makeInitialPayment(@Body() initialPaymentDto: InitialPaymentDto, @Req() req: Request) {
    return this.clientService.makeInitialPayment(initialPaymentDto, req['currentUser']);
  }

  @Post('make-initial-payment2')
  @HttpCode(200)
  @ApiOperation({ summary: 'Make initial payment to vendor' })
  @ApiResponse({ status: 201, description: 'Success.', type: InitialPaymentDto })
  makeInitialPayment2(@Body() initialPaymentDto: InitialPaymentDto, @Req() req: Request) {
    return this.clientService.makeInitialPayment2(initialPaymentDto, req['currentUser']);
  }

  @Get('client-own-category-list')
  @HttpCode(200)
  @ApiOperation({ summary: 'Client category listing' })
  @ApiResponse({ status: 201, description: 'Success.' })
  clientCategoryListing(@Req() req: Request) {
    return this.clientService.clientOwnCategoryList(req['currentUser']);
  }

  @Patch('close-job')
  @HttpCode(200)
  @ApiOperation({ summary: 'Close job client side' })
  @ApiResponse({ status: 201, description: 'Success.', type: CloseJobDto })
  closeJob(@Body() closeJobDto: CloseJobDto, @Req() req: Request) {
    return this.clientService.closeJob(closeJobDto, req['currentUser']);
  }

  @Get('acepted-job-vendor-user')
  @HttpCode(200)
  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobDetailDto })
  acceptedVendorUserForJob(@Query() jobDetailDto: JobDetailDto, @Req() req: Request) {
    return this.clientService.acceptedVendorUserForJob(jobDetailDto, req['currentUser']);
  }

  @Post('vendor-report-job')
  @HttpCode(200)
  @ApiOperation({ summary: 'Report job client side' })
  @ApiResponse({ status: 201, description: 'Success.', type: SupportJobDto })
  reportJob(@Body() supportJobDto: SupportJobDto, @Req() req: Request) {
    return this.clientService.reportJob(supportJobDto, req['currentUser']);
  }

  @Post('customer-issue')
  @HttpCode(200)
  @ApiOperation({ summary: 'Customer issue job client side' })
  @ApiResponse({ status: 201, description: 'Success.', type: SupportJobDto })
  customerIssue(@Body() supportJobDto: SupportJobDto, @Req() req: Request) {
    return this.clientService.customerIssue(supportJobDto, req['currentUser']);
  }

  @Post('vendor-refund-request')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refund request job client side' })
  @ApiResponse({ status: 201, description: 'Success.', type: RefundRequestDto })
  requestRefund(@Body() refundRequestDto: RefundRequestDto, @Req() req: Request) {
    return this.clientService.requestRefund(refundRequestDto, req['currentUser']);
  }

  @Patch('edit-job-client')
  @HttpCode(200)
  @ApiOperation({ summary: 'Edit job from client side' })
  @ApiResponse({ status: 201, description: 'Success.', type: EditJobClientDto })
  editJobVendorSide(@Body() editJobClientDto: EditJobClientDto, @Req() req: Request) {
    return this.clientService.editJobClientSide(editJobClientDto, req['currentUser']);
  }

  @Patch('approve-edit-job-client')
  @HttpCode(200)
  @ApiOperation({ summary: 'Approve edit job if vendor has made any changes' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobDetailDto })
  approveEditJobClientSide(@Body() jobDetailDto: JobDetailDto, @Req() req: Request) {
    return this.clientService.approveEditJobClientSide(jobDetailDto, req['currentUser']);
  }

  @Patch('decline-edit-job-client')
  @HttpCode(200)
  @ApiOperation({ summary: 'Decline edit job if vendor has made any changes' })
  @ApiResponse({ status: 201, description: 'Success.', type: DeclineEditJobClientDto })
  declineEditJobClientSide(@Body() declineEditJobClientDto: DeclineEditJobClientDto, @Req() req: Request) {
    return this.clientService.declineEditJobClientSide(declineEditJobClientDto, req['currentUser']);
  }

  @Get('test-api')
  @HttpCode(200)
  @ApiOperation({ summary: '' })
  @ApiResponse({ status: 201, description: 'Success.'})
  testApi() {
    return this.clientService.testApi();
  }

  @Post('add-new-task')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add new task for job' })
  @ApiResponse({ status: 201, description: 'Success.', type: AddNewTaskDto })
  addNewTask(@Body() addNewTaskDto: AddNewTaskDto, @Req() req: Request) {
    return this.clientService.addNewTask(addNewTaskDto, req['currentUser']);
  }

  @Patch('update-new-task')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update new task for job' })
  @ApiResponse({ status: 201, description: 'Success.', type: UpdateNewTaskDto })
  updateNewTask(@Body() updateNewTaskDto: UpdateNewTaskDto, @Req() req: Request) {
    return this.clientService.updateNewTask(updateNewTaskDto, req['currentUser']);
  }

  @Get('list-task')
  @HttpCode(200)
  @ApiOperation({ summary: 'List tasks for job' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobDetailDto })
  listTaskClient(@Query() jobDetailDto: JobDetailDto, @Req() req: Request) {
    return this.clientService.listTaskClient(jobDetailDto, req['currentUser']);
  }

  @Get('list-approved-task')
  @HttpCode(200)
  @ApiOperation({ summary: 'List approved tasks for job' })
  @ApiResponse({ status: 201, description: 'Success.', type: JobDetailDto })
  listApprovedTaskClient(@Query() jobDetailDto: JobDetailDto, @Req() req: Request) {
    return this.clientService.listApprovedTaskClient(jobDetailDto, req['currentUser']);
  }

  @Post('add-comment-client')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add comment for task by client' })
  @ApiResponse({ status: 201, description: 'Success.', type: AddCommentClientDto })
  addCommentClient(@Body() addCommentClientDto: AddCommentClientDto, @Req() req: Request) {
    return this.clientService.addCommentClient(addCommentClientDto, req['currentUser']);
  }

  @Patch('approve-task')
  @HttpCode(200)
  @ApiOperation({ summary: 'Approve task by client' })
  @ApiResponse({ status: 201, description: 'Success.', type: TaskCommonDto })
  approveTask(@Body() taskCommonDto: TaskCommonDto, @Req() req: Request) {
    return this.clientService.approveTask(taskCommonDto, req['currentUser']);
  }

  @Patch('cancel-job-client')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel job client side' })
  @ApiResponse({ status: 201, description: 'Success.', type: CancelJobClientDto })
  cancelJobClient(@Body() cancelJobClientDto: CancelJobClientDto, @Req() req: Request) {
    return this.clientService.cancelJobClient(cancelJobClientDto, req['currentUser']);
  }

  @Get('job-listing-pop-up')
  @HttpCode(200)
  @ApiOperation({ summary: 'Job listing for pop up' })
  @ApiResponse({ status: 201, description: 'Success.' })
  jobListingForPopUp(@Req() req: Request) {
    return this.clientService.jobListingForPopUp(req['currentUser']);
  }

  @Get('billing-history-client')
  @HttpCode(200)
  @ApiOperation({ summary: 'Billing history client side' })
  @ApiResponse({ status: 201, description: 'Success.' })
  billingHistoryClient(@Req() req: Request) {
    return this.clientService.billingHistoryClient(req['currentUser']);
  }

  @Get('job-spend-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Job spend data client side' })
  @ApiResponse({ status: 201, description: 'Success.' })
  jobSpendData(@Req() req: Request) {
    return this.clientService.jobSpendData( req['currentUser']);
  }
  
}
