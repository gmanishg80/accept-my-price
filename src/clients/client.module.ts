import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Job, JobSchema } from 'src/schemas/job.schema';
import { JobAction, JobActionSchema } from 'src/schemas/job-action.schema';
import { VendorProfile, VendorProfileSchema } from 'src/schemas/vendor-profile.schema';
import { PaymentLog, PaymentLogSchema } from 'src/schemas/payment-log.schema';
import { Support, SupportSchema } from 'src/schemas/support.schema';
import { JobTask, JobTaskSchema } from 'src/schemas/job-task.schema';
import { TaskComment, TaskCommentSchema } from 'src/schemas/task-comment.schema';

import { BullModule } from '@nestjs/bullmq';
import { AiImageProcessor } from '../common/helpers/bullmqProcessors/ai-generate-image';
import { AiJobTaskProcessor } from '../common/helpers/bullmqProcessors/ai-generate-job-task';


@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Job.name, schema: JobSchema },
    { name: JobAction.name, schema: JobActionSchema },
    { name: VendorProfile.name, schema: VendorProfileSchema },
    { name: PaymentLog.name, schema: PaymentLogSchema },
    { name: Support.name, schema: SupportSchema },
    { name: JobTask.name, schema: JobTaskSchema },
    { name: TaskComment.name, schema: TaskCommentSchema }
  ]),
    BullModule.registerQueue({name: 'ai-image-queue'}),
    BullModule.registerQueue({name: 'ai-job-task-queue'})
],
  controllers: [ClientController],
  providers: [ClientService, AiImageProcessor, AiJobTaskProcessor],
})
export class ClientModule { }