import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Job, JobSchema } from 'src/schemas/job.schema';
import { CommonFunction } from 'src/common/helpers/common.function';
import { VendorProfile, VendorProfileSchema } from 'src/schemas/vendor-profile.schema';
import { VendorSubscription, VendorSubscriptionSchema } from 'src/schemas/vendor-subscription.schema';
import { VendorTransaction, VendorTransactionSchema } from 'src/schemas/vendor-transaction.schema';
import { JobAction, JobActionSchema } from 'src/schemas/job-action.schema';
import { Support, SupportSchema } from 'src/schemas/support.schema';
import { Service, ServiceSchema } from 'src/schemas/service.schema';
import { TaskComment, TaskCommentSchema } from 'src/schemas/task-comment.schema';
import { JobTask, JobTaskSchema } from 'src/schemas/job-task.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { Notification, NotificationSchema } from 'src/schemas/notification.schema';
import { PaymentLog, PaymentLogSchema } from 'src/schemas/payment-log.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Job.name, schema: JobSchema },
    { name: VendorProfile.name, schema: VendorProfileSchema },
    { name: VendorSubscription.name, schema: VendorSubscriptionSchema },
    { name: VendorTransaction.name, schema: VendorTransactionSchema },
    { name: JobAction.name, schema: JobActionSchema },
    { name: Support.name, schema: SupportSchema },
    { name: Service.name, schema: ServiceSchema },
    { name: JobTask.name, schema: JobTaskSchema },
    { name: TaskComment.name, schema: TaskCommentSchema },
    { name: Category.name, schema: CategorySchema },
    { name: Notification.name, schema: NotificationSchema },
    { name: PaymentLog.name, schema: PaymentLogSchema },

  ])],
  controllers: [VendorController],
  providers: [VendorService, CommonFunction],
})
export class VendorModule { }