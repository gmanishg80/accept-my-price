import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { ConstantValues, ResponseMessage } from 'src/common/constants/message';
import { CommonFunction } from '../common/helpers/common.function';
import { S3Function } from '../common/helpers/s3';
import { LoginUserDto } from './dto/login-user.dto';
import { SocialLoginUserDto } from './dto/social-login-user.dto';
import { ChangeUserPasswordDto, ForgetUserPasswordDto, ResetUserPasswordDto } from './dto/change-user-password.dto';
import Stripe from 'stripe';
import { VerifyEmailDto } from './dto/verify-user-email.dto';
import { UserCardDto } from './dto/user-card.dto';
import { NotificationPreferenceDto } from './dto/notification-preference.dto';
import { UserAuthToken } from 'src/schemas/user-auth-token.schema';
import { CreatePaymentIntentDto } from './dto/payment-intent-dto';
import { VendorSubscription } from 'src/schemas/vendor-subscription.schema';
import { VendorTransaction } from 'src/schemas/vendor-transaction.schema';
import { DeleteMediaDto } from './dto/delete-media.dto';
import { VendorProfile } from 'src/schemas/vendor-profile.schema';
// import { HelperREspobse } from 'src/common/helpers/ttttttttttt';



@Injectable()
export class UserService {
    Stripe: Stripe;
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(UserAuthToken.name) private userAuthTokenModel: Model<UserAuthToken>,
        @InjectModel(VendorSubscription.name) private vendorSubsModel: Model<VendorSubscription>,
        @InjectModel(VendorTransaction.name) private vendorTransactionModel: Model<VendorTransaction>,
        @InjectModel(VendorProfile.name) private vendorProfileModel: Model<VendorProfile>,

        private commonFunction: CommonFunction,
        private s3: S3Function,
        // private helperREspobse: HelperREspobse,
    ) { this.Stripe = new Stripe(process.env.STRIPE_SECRET_KEY);}

    async currentUserData(userId: any) {
        try {
            const findUser = await this.userModel.findById({ _id: userId});
            return findUser;
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async pingMe() {
        try {
            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, null, HttpStatus.OK);
            // return this.helperREspobse.successResponse(res, 'ooooooooooooooooooooo')
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async userSignUp(createUserDto: CreateUserDto) {
        try {
            const { password, user_type } = createUserDto;
            const email = createUserDto.email.toLowerCase();
            const findEmail = await this.userModel.findOne({ email });
            if (findEmail) {
                return new ResponseError(ResponseMessage.EMAIL_ALREADY_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const refUserData = {
                email: email,
                password: await this.commonFunction.hashPassword(password),
                user_type,
                login_type: 'email',
                email_otp: '123456' //await this.commonFunction.generateOtp()
            };

            const newUser = new this.userModel(refUserData);
            const saveUser = await newUser.save();

            // const token = await this.commonFunction.generateToken(saveUser.id);

            const customer = await this.Stripe.customers.create({ email: email });
            if (customer) {
                await this.userModel.findByIdAndUpdate({ _id: saveUser._id }, { customer_id: customer.id })
            }

            return new ResponseSuccess(ResponseMessage.OTP_SENT_SUCCESS, null, HttpStatus.OK);
        } 
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyEmailOtp(verifyEmailDto: VerifyEmailDto) {
        try {
            const { otp } = verifyEmailDto;
            const email = verifyEmailDto.email.toLowerCase();

            const findEmail = await this.userModel.findOne({ email });
            if (!findEmail) {
                return new ResponseError(ResponseMessage.USER_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            if(findEmail.email_otp !== otp) {
                return new ResponseError(ResponseMessage.WRONG_OTP, null, HttpStatus.BAD_REQUEST);
            }

            const token = await this.commonFunction.generateToken(findEmail.id);
            await this.userModel.updateOne({ _id: findEmail._id }, { is_email_verified: true });
            await this.userAuthTokenModel.create({ user_id: new mongoose.Types.ObjectId(findEmail._id), token: token });
            return new ResponseSuccess(ResponseMessage.OTP_VERIFY_SUCCESS, { user: findEmail, token }, HttpStatus.OK);
        } 
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async userLogIn(loginUserDto: LoginUserDto) {
        try {
            const { password } = loginUserDto;
            const email = loginUserDto.email.toLowerCase();

            const findEmail = await this.userModel.findOne({ email });
            if (!findEmail) {
                return new ResponseError(ResponseMessage.USER_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            if (findEmail.is_email_verified === false) {
                return new ResponseError(ResponseMessage.EMAIL_NOT_VERIFIED, { user: findEmail, is_email_verified: findEmail.is_email_verified }, HttpStatus.BAD_REQUEST);
            }

            const verifyPassword = await this.commonFunction.comparePassword(password, findEmail.password);
            if(!verifyPassword) {
                return new ResponseError(ResponseMessage.INCORRECT_PASSWORD, null, HttpStatus.BAD_REQUEST);
            }

            const token = await this.commonFunction.generateToken(findEmail.id);
            await this.userAuthTokenModel.create({ user_id: new mongoose.Types.ObjectId(findEmail._id), token: token });
            return new ResponseSuccess(ResponseMessage.USER_LOGGEDIN_SUCCESS, { user: findEmail, token }, HttpStatus.OK);
        } 
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async userSocialLogIn(socialLoginUserDto: SocialLoginUserDto) {
        try {
            const { first_name, last_name, google_id, apple_id, user_type, login_type } = socialLoginUserDto;
            const email = socialLoginUserDto?.email.toLowerCase();

            // let type: string;
            const condition = {};

            if (login_type === 'google') {
                condition['google_id'] = google_id
                condition['login_type'] = 'google'
            }
            if (login_type === 'apple') {
                condition['apple_id'] = apple_id
                condition['login_type'] = 'apple'
            }

            const findUser = await this.userModel.findOne(condition);
            if (!findUser) {
                console.log('1111')
                const findEmail = await this.userModel.findOne({ email });
                if (!findEmail) {
                    console.log('2222')
                    const refUserData = {
                        first_name,
                        last_name,
                        email,
                        google_id: google_id ?? '',
                        apple_id: apple_id ?? '',
                        user_type,
                        login_type,
                        is_email_verified: true
                    }

                    const newUser = new this.userModel(refUserData);
                    const saveUser = await newUser.save();
                    const customer = await this.Stripe.customers.create({ email: email });
                    if (customer) {
                        await this.userModel.findByIdAndUpdate({ _id: saveUser._id }, { customer_id: customer.id })
                    }

                    const token = await this.commonFunction.generateToken(saveUser.id);
                    await this.userAuthTokenModel.create({ user_id: new mongoose.Types.ObjectId(saveUser._id), token: token });
                    return new ResponseSuccess(ResponseMessage.USER_LOGGEDIN_SUCCESS, { user: saveUser, token }, HttpStatus.OK);
                }
                else {
                    console.log('3333')
                    const refUserData = {
                        first_name,
                        last_name,
                        // email,
                        google_id: google_id ?? '',
                        apple_id: apple_id ?? '',
                        user_type,
                        login_type,
                        // is_email_verified: true
                    }

                    await this.userModel.findOneAndUpdate({ _id: findEmail._id }, refUserData);

                    const token = await this.commonFunction.generateToken(findEmail.id);
                    await this.userAuthTokenModel.create({ user_id: new mongoose.Types.ObjectId(findEmail._id), token: token });
                    return new ResponseSuccess(ResponseMessage.USER_LOGGEDIN_SUCCESS, { user: findEmail, token }, HttpStatus.OK);
                }
            }
            else {
                console.log('4444')
                const token = await this.commonFunction.generateToken(findUser.id);
                await this.userAuthTokenModel.create({ user_id: new mongoose.Types.ObjectId(findUser._id), token: token });
                return new ResponseSuccess(ResponseMessage.USER_LOGGEDIN_SUCCESS, { user: findUser, token }, HttpStatus.OK);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }   

    async userProfileData(currentUser: any) {
        try {
            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, currentUser, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }  

    async userAuthTokenData(token: string) {
        try {
            const findUserAuthTokenData = await this.userAuthTokenModel.findOne({ token });
            if (!findUserAuthTokenData) {
                return new ResponseError(ResponseMessage.AUTH_TOKEN_EXPIRED, null, HttpStatus.UNAUTHORIZED);
            }

            return findUserAuthTokenData;
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }  
    
    async changeUserPassword(changeUserPasswordDto: ChangeUserPasswordDto, currentUser: any) {
        try {
            const { new_password } = changeUserPasswordDto;
            console.log('oooooooooooooo', currentUser)
            const verifyPassword = await this.commonFunction.comparePassword(new_password, currentUser?.password);
            if(verifyPassword) {
                return new ResponseError(ResponseMessage.SAME_PASSWORD, null, HttpStatus.BAD_REQUEST);
            }

            await this.userModel.updateOne({ _id: currentUser?._id }, { password: await this.commonFunction.hashPassword(new_password) });
            return new ResponseSuccess(ResponseMessage.PASSWORD_UPDATE_SUCCESS, '', HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }  
    
    async forgetUserPassword(forgetUserPasswordDto: ForgetUserPasswordDto) {
        try {
            const { email } = forgetUserPasswordDto;

            const findEmail = await this.userModel.findOne({ email: email.toLowerCase() });
            if (!findEmail) {
                return new ResponseError(ResponseMessage.USER_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }
            
            // const otp = await this.commonFunction.generateOtp()
            await this.userModel.updateOne({ _id: findEmail._id }, { email_otp: '123456' });
            //calling sendgrid
            return new ResponseSuccess(ResponseMessage.FORGET_EMAIL_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }  

    async resendEmailOtp(forgetUserPasswordDto: ForgetUserPasswordDto) {
        try {
            const { email } = forgetUserPasswordDto;

            const findEmail = await this.userModel.findOne({ email });
            if (!findEmail) {
                return new ResponseError(ResponseMessage.USER_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }
            
            // const otp = await this.commonFunction.generateOtp()
            await this.userModel.updateOne({ _id: findEmail._id }, { email_otp: '123456' });
            //calling sendgrid
            return new ResponseSuccess(ResponseMessage.OTP_SENT_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }  

    async resetUserPassword(resetUserPasswordDto: ResetUserPasswordDto) {
        try {
            const { email, new_password } = resetUserPasswordDto;

            const findEmail = await this.userModel.findOne({ email: email.toLowerCase()  });
            if (!findEmail) {
                return new ResponseError(ResponseMessage.USER_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            await this.userModel.updateOne({ _id: findEmail._id }, { password: await this.commonFunction.hashPassword(new_password) });
            return new ResponseSuccess(ResponseMessage.PASSWORD_UPDATE_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }  

    async uploadMedia(req: Request) {
        try {
            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, req['files'], HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 

    async deleteMedia(deleteMediaDto: DeleteMediaDto) {    
        try {
            const { file_url } = deleteMediaDto;
    
            await this.s3.deleteFileFromS3(file_url);
    
            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, null, HttpStatus.OK);
        } catch (error) {
            console.error('Error deleting media:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }    

    async addCard(userCardDto: UserCardDto, currentUser: any) {
        try {
            const { payment_method_id } = userCardDto;

            const attachPaymentMethod = await this.Stripe.paymentMethods.attach(payment_method_id, { customer: currentUser.customer_id });
            if (attachPaymentMethod) {
                return new ResponseSuccess(ResponseMessage.CARD_ATTACH_SUCCESS, null, HttpStatus.OK);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async listCard(currentUser: any) {
        try {
            // console.log('****', currentUser.customer_id)
            // const paymentMethods = await this.Stripe.paymentMethods.list({
            //     customer: currentUser.customer_id,
            //     type: 'card',
            // });

            const customer = await this.Stripe.customers.retrieve(currentUser.customer_id);

            const paymentMethods = await this.Stripe.paymentMethods.list({
                customer: currentUser.customer_id,
                type: 'card',
            });

            const resData = {
                customer,
                paymentMethods: paymentMethods.data
            }

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, resData, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            if (error.type === 'StripeInvalidRequestError' && error.message.includes('No such customer')) {
                return new ResponseError(ResponseMessage.CUSTOMER_NOT_FOUND, null, HttpStatus.NOT_FOUND);
            }

            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 

    async deleteCard(userCardDto: UserCardDto, currentUser: any) {
        try {
            const { payment_method_id } = userCardDto;

            const detachedPaymentMethod = await this.Stripe.paymentMethods.detach(payment_method_id);
            if (detachedPaymentMethod) {
                return new ResponseSuccess(ResponseMessage.CARD_DETACH_SUCCESS, null, HttpStatus.OK);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async setDefaultCard(userCardDto: UserCardDto, currentUser: any) {
        try {
            const { payment_method_id } = userCardDto;

            const updatedCustomer = await this.Stripe.customers.update(currentUser.customer_id, {
                invoice_settings: {
                    default_payment_method: payment_method_id,
                },
            });

            if (updatedCustomer) {
                return new ResponseSuccess(ResponseMessage.CARD_DEFAULT_SUCCESS, null, HttpStatus.OK);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 

    async retrievePaymentMethod(userCardDto: UserCardDto, currentUser: any) {
        try {
            const { payment_method_id } = userCardDto;

            const paymentMethod = await this.Stripe.paymentMethods.retrieve(payment_method_id);
            if (paymentMethod) {
                return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, paymentMethod, HttpStatus.OK);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 

    async updateNotificationPreference(notificationPreferenceDto: NotificationPreferenceDto, currentUser: any) {
        try {
            const { email_notification, phone_notification } = notificationPreferenceDto;
            console.log('start body', notificationPreferenceDto)
            const dataObj = {
                email_notification: !!email_notification, // Ensure boolean value
                phone_notification: !!phone_notification, // Ensure boolean value
            };
            console.log('aftre body', dataObj)
            
            await this.userModel.findByIdAndUpdate({ _id: currentUser._id }, dataObj);

            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 
    
    async updateSkipStatus(currentUser: any) {
        try {
            if (currentUser.user_type !== 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }
            
            const updateProfile = await this.userModel.findOneAndUpdate({ _id: currentUser?._id }, { profile_status: ConstantValues.PROFILE_STATUS_3 }, { new: true });
            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, updateProfile, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }  

    async userLogOut(headers: any) {
        try {
            const token = headers['authorization'];
                console.log('oooooooooooooooooooooo', token.split(' ')[1])
            const findUserAuthToken = await this.userAuthTokenData(token.split(' '));
            if(!findUserAuthToken) {
                return new ResponseError(ResponseMessage.INVALID_TOKEN, null, HttpStatus.UNAUTHORIZED);
            }

            await this.userAuthTokenModel.deleteOne({ token: token.split(' ')[1] });
            
            return new ResponseSuccess(ResponseMessage.USER_LOGGEDOUT_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }  
    
    async updateProfileData(updateUserDto: UpdateUserDto, currentUser: any) {
        try {
            // const { first_name, last_name, dial_code, phone, street, city, state, zip, country } = updateUserDto;

            const keys = ['first_name', 'last_name', 'dial_code', 'phone_number', 'address', 'profile_img', 'longitude', 'latitude', 'bussiness_name', 'fein'];
            const objToUpdate = {};
            const vendorProfileObjToUpdate = {};

            let longitude = null;
            let latitude = null;
            
            for (const key of keys) {
                if (updateUserDto[key] != null) {
                    if (key === 'longitude') {
                        longitude = updateUserDto[key];
                        objToUpdate[key] = updateUserDto[key];
                    }
                    else if (key === 'latitude') {
                        latitude = updateUserDto[key];
                        objToUpdate[key] = updateUserDto[key];
                    }
                    else if (key === 'bussiness_name' || key === 'fein') {
                        vendorProfileObjToUpdate[key] = updateUserDto[key];
                    }
                    else {
                        objToUpdate[key] = updateUserDto[key];
                    }
                }
            }
            
            if (longitude != null && latitude != null) {
              objToUpdate['location'] = {
                type: 'Point',
                coordinates: [longitude, latitude],
              };
            }

            const updateUser = await this.userModel.findByIdAndUpdate({ _id: currentUser?._id }, objToUpdate, { new: true });
            await this.vendorProfileModel.updateOne({ vendor_user_id: currentUser?._id }, vendorProfileObjToUpdate);
            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, updateUser, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }  

    async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto, currentUser: any) {
        try {
            const { payment_method_id, amount } = createPaymentIntentDto;
    
            const paymentIntent = await this.Stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'USD',
                customer: currentUser.customer_id,
                payment_method: payment_method_id,
                confirm: true,
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                }
            });

            // await this.userModel.updateOne({ _id: currentUser._id }, { profile_status: ConstantValues.PROFILE_STATUS_1, subscription_status: true });
            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, paymentIntent, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async confirmPaymentIntentWebhook(bodyData: any, headers: any) {
        try {
            console.log('headerssssss======', headers)
            const sig = headers['stripe-signature'];
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

            let event: Stripe.Event;

            try {
                event = this.Stripe.webhooks.constructEvent(bodyData, sig, endpointSecret);
            }
            catch (err) {
                console.error('Webhook signature verification failed:', err.message);
                return new ResponseError('Webhook Error', null, HttpStatus.BAD_REQUEST);
            }

            if (event.type === 'payment_intent.succeeded') {
                await this.handlePaymentSucceeded(event);
            } else if (event.type === 'payment_intent.payment_failed') {
                console.error('Payment failed:', event.data.object);
            } else {
                console.log(`Unhandled event type ${event.type}`);
            }

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, { received: true }, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error in webhook:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async handlePaymentSucceeded(event: Stripe.Event) {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        const currentUser = await this.userModel.findOne({ customer_id: paymentIntent.customer });
        if (!currentUser) {
            console.error('User not found for customer_id:', paymentIntent.customer);
            return; // Exit if no user is found
        }

        await this.updateDatabase(paymentIntent, currentUser);
    }

    async updateDatabase(paymentIntent: Stripe.PaymentIntent, currentUser: any) {
        const { customer } = paymentIntent;
    
        try {
            await this.userModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId('676002e147daaf75da82da94') }, { last_name: 'Webhooooookkkk' });
            await this.userModel.findOneAndUpdate({ _id: '676002e147daaf75da82da94' }, { last_name: 'Webhooooookkkkppp' });
            // // Retrieve subscription
            // const retrieveSubscription = await this.Stripe.subscriptions.retrieve(currentUser.subscription_id);
            // if (!retrieveSubscription) {
            //     console.error('Subscription not found');
            //     return;
            // }
    
            // // Reference data for updating user profile
            // const refUserData = {
            //     profile_status: ConstantValues.PROFILE_STATUS_1,
            //     subscription_id: retrieveSubscription.id,
            //     subscription_plan_id: retrieveSubscription['plan'].id,
            //     subscription_status: true,
            // };
    
            // // Reference data for vendor subscription and transaction records
            // const refData = {
            //     vendor_user_id: currentUser._id,
            //     subscription_id: retrieveSubscription.id,
            //     customer_id: currentUser.customer_id,
            //     price_id: retrieveSubscription['plan'].id,
            //     start_date: retrieveSubscription.start_date,
            //     status: 'active',
            // };
    
            // // Database transactions
            // await Promise.all([
            //     this.vendorSubsModel.create(refData),
            //     this.vendorTransactionModel.create(refData),
            //     this.userModel.updateOne({ _id: currentUser._id }, refUserData),
            // ]);
    
            console.log('Database updated successfully');
        } catch (error) {
            console.error('Database update failed:', error);
        }
    }
    

}
