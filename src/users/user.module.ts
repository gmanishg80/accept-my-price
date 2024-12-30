import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CommonFunction } from '../common/helpers/common.function';
import { S3Function } from '../common/helpers/s3';
import { UserAuthToken, UserAuthTokenSchema } from 'src/schemas/user-auth-token.schema';
import { VendorSubscription, VendorSubscriptionSchema } from 'src/schemas/vendor-subscription.schema';
import { VendorTransaction, VendorTransactionSchema } from 'src/schemas/vendor-transaction.schema';
import { VendorProfile, VendorProfileSchema } from 'src/schemas/vendor-profile.schema';
// import { HelperREspobse } from 'src/common/helpers/ttttttttttt';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: UserAuthToken.name, schema: UserAuthTokenSchema },
    { name: VendorSubscription.name, schema: VendorSubscriptionSchema },
    { name: VendorTransaction.name, schema: VendorTransactionSchema },
    { name: VendorProfile.name, schema: VendorProfileSchema }
  ])],
  controllers: [UserController],
  providers: [UserService, CommonFunction, S3Function, /*HelperREspobse*/],
  exports: [UserService]
})
export class UserModule { }