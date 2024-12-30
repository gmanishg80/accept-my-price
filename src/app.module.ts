import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './common/middlewares/user.auth';
import { UserService } from './users/user.service';
import { ClientModule } from './clients/client.module';
import { AdminModule } from './admins/admin.module';
import { VendorModule } from './vendors/vendor.module';
import * as bodyParser from 'body-parser';
import { RawBodyMiddleware } from './common/middlewares/raw-body.middleware';
import { BullModule } from '@nestjs/bullmq';

@Module({ // process.env.MONGO_CONNECTION_URI
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,  // Makes ConfigModule available globally
    }),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION_URI), 
    // MongooseModule.forRoot('mongodb://localhost:27017/acceptMyPrice_local'), 
    UserModule,
    ClientModule,
    VendorModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    
    consumer

      // // Apply raw body handling for Stripe webhook route
      // .apply(bodyParser.raw({ type: 'application/json' }))
      // .forRoutes({ path: 'webhook/stripe', method: RequestMethod.POST }) // Replace with your actual Stripe webhook route

      // .apply(RawBodyMiddleware)
      // .forRoutes(
      // {
      //   path: 'user/confirm-payment-intent',
      //   method: RequestMethod.POST,
      // })
      .apply(AuthMiddleware)
      .exclude(
        { path: 'user/ping-me', method: RequestMethod.GET },
        { path: 'user/sign-up', method: RequestMethod.POST },
        { path: 'user/verify-email-otp', method: RequestMethod.POST },
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/social-login', method: RequestMethod.POST },
        { path: 'user/forget-user-password', method: RequestMethod.POST },
        { path: 'user/resend-email-otp', method: RequestMethod.POST },
        { path: 'user/reset-user-password', method: RequestMethod.PATCH },
        { path: 'admin/create-category', method: RequestMethod.POST },
        { path: 'admin/add-sub-category', method: RequestMethod.POST },
        { path: 'admin/category-listing', method: RequestMethod.GET },
        { path: 'admin/ai-category-data', method: RequestMethod.GET },
        { path: 'admin/ai-generate-image', method: RequestMethod.GET },
        { path: 'vendor/success-url', method: RequestMethod.GET },
        { path: 'vendor/cancel-url', method: RequestMethod.GET },
        { path: 'vendor/refresh-url/:user_id', method: RequestMethod.GET },
        { path: 'vendor/return-url/:user_id', method: RequestMethod.GET },
        { path: 'client/popular-job-home', method: RequestMethod.GET },
        { path: 'vendor/popular-service-home', method: RequestMethod.GET },
        { path: 'vendor/test-stripe', method: RequestMethod.POST },
        { path: 'user/confirm-payment-intent', method: RequestMethod.POST }, 
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL })

  }
}

