import { HttpStatus, Injectable, Query, Res } from '@nestjs/common';
import { CreateVendorProfileDto } from './dto/create-vendor-profile.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { ResponseMessage, ConstantValues } from 'src/common/constants/message';
import { CommonFunction } from '../common/helpers/common.function';
import { Job } from 'src/schemas/job.schema';
import { VendorProfile } from 'src/schemas/vendor-profile.schema';
import Stripe from 'stripe';
import { AddPaymentDto } from './dto/add-payment.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { VendorSubscription } from 'src/schemas/vendor-subscription.schema';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { VendorTransaction } from 'src/schemas/vendor-transaction.schema';
import { JobListingDto, PopularServiceListingDto } from './dto/job-listing.dto';
import { AddTeamMemberDto, UpdateTeamMemberDto, DeleteTeamMemberDto } from './dto/add-team-member.dto';
import { OpenJobListingDto } from './dto/open-job-listing.dto';
import { JobActionDto } from './dto/job-action.dto';
import { JobAction } from 'src/schemas/job-action.schema';
import { AddFeedbackClientDto } from './dto/add-feedback-client.dto';
import { JobDetailDto } from './dto/job-detail.dto';
import * as moment from 'moment';
import { Support } from 'src/schemas/support.schema';
import { RefundRequestDto, SupportJobDto } from './dto/support-job.dto';
import { Service } from 'src/schemas/service.schema';
import { ServiceItemDto } from './dto/service-item.dto';
import { CloseJobDto } from './dto/close-job.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { CancelJobVendorDto } from './dto/cancel-job-vendor.dto';
import { EditJobVendorDto } from './dto/edit-job-vendor.dto';
import { DeclineEditJobVendorDto } from './dto/decline-edit-job-vendor.dto';
import { Connection } from 'mongoose';
import { AddCommentVendorDto } from './dto/add-comment-vendor.dto';
import { TaskComment } from 'src/schemas/task-comment.schema';
import { JobTask } from 'src/schemas/job-task.schema';
import { AddOnServiceDto } from './dto/add-on-service.dto';
import { Category } from 'src/schemas/category.schema';
import { Notification } from 'src/schemas/notification.schema';
import { PaymentLog } from 'src/schemas/payment-log.schema';
import { PayoutListingFilterDto } from './dto/payout-listing-filter.dto';

@Injectable()
export class VendorService {
    Stripe: Stripe;
    res: any;
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Job.name) private jobModel: Model<Job>,
        @InjectModel(VendorProfile.name) private vendorProfileModel: Model<VendorProfile>,
        @InjectModel(VendorSubscription.name) private vendorSubsModel: Model<VendorSubscription>,
        @InjectModel(VendorTransaction.name) private vendorTransactionModel: Model<VendorTransaction>,
        @InjectModel(JobAction.name) private jobActionModel: Model<JobAction>,
        @InjectModel(Support.name) private supportModel: Model<Support>,
        @InjectModel(Service.name) private serviceModel: Model<Service>,
        @InjectModel(JobTask.name) private jobTaskModel: Model<JobTask>,
        @InjectModel(TaskComment.name) private taskCommentModel: Model<TaskComment>,
        @InjectModel(Category.name) private categoryModel: Model<Category>,
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        @InjectModel(PaymentLog.name) private paymentLogModel: Model<PaymentLog>,

        @InjectConnection() private readonly connection: Connection,
        private commonFunction: CommonFunction
    ) {
        this.Stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    // async createVendorSubscription(createSubscriptionDto: CreateSubscriptionDto, currentUser: any ) {
    //     try {
    //         const { price_id } = createSubscriptionDto;

    //         // const email = createSubscriptionDto.email.toLowerCase();

    //         // const findVendorProfile = await this.vendorProfileModel.findOne({ vendor_user_id: currentUser._id });
    //         // if(!findVendorProfile) {
    //         //     return new ResponseError(ResponseMessage.PROFILE_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
    //         // }

    //         if(currentUser.user_type === 'client') {
    //             return new ResponseError(ResponseMessage.SUBSCRIPTION_NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
    //         }

    //         if(currentUser.user_type === 'vendor' && currentUser.subscription_status === true) {
    //             return new ResponseError(ResponseMessage.SUBSCRIPTION_ALREADY_EXIST, null, HttpStatus.BAD_REQUEST);
    //         }

    //         if(currentUser.profile_status !== 0) {
    //             return new ResponseError(ResponseMessage.NOT_AUTHORIZED, { profile_status: currentUser.profile_status }, HttpStatus.BAD_REQUEST);
    //         }

    //         const token = await this.commonFunction.generateToken(currentUser._id);

    //         const createSession = await this.Stripe.checkout.sessions.create({
    //             mode: 'subscription',
    //             line_items: [
    //                 {
    //                     price: price_id,
    //                     quantity: 1,
    //                 }
    //             ],
    //             customer: currentUser.customer_id,
    //             //trial_period_days: 30,
    //             //customer_email: email,
    //             // subscription_data: {
    //             //     "trial_period_days": 30  //temp for testing
    //             // },
    //             metadata: {
    //                 user_id: currentUser._id.toString(), // Convert to string
    //                 // vendor_profile_id: findVendorProfile.id.toString(), // Convert to string
    //                 email: currentUser.email || '', // Ensure this is a string
    //                 price_id: price_id.toString() // Ensure this is a string, if not already
    //             },
    //             //description: `Monthly subscription for Club: ${findClub.clubName}`,

    //             success_url: `${process.env.API_BASE_URL}/vendor/success-url?session_id={CHECKOUT_SESSION_ID}&token=${token}&userId=${currentUser._id}`,
    //             cancel_url: `${process.env.API_BASE_URL}/vendor/cancel-url`,
    //         });

    //         if (!createSession) {
    //             return new ResponseError(ResponseMessage.CHECKOUT_FAILED, null, HttpStatus.BAD_REQUEST);
    //         }

    //         return new ResponseSuccess(ResponseMessage.CHECKOUT_SUCCESS, { payment_status: createSession.payment_status, url: createSession.url }, HttpStatus.OK);
    //     }
    //     catch (error) {
    //         console.error('Error creating user:', error);
    //         return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    // async successUrl(session_id: string) {
    //     try {
    //         console.log('session_idsession_id', session_id)
    //         const retrieveSession = await this.Stripe.checkout.sessions.retrieve(session_id);
    //         if (retrieveSession.payment_status === 'paid' && retrieveSession.status === 'complete') {
    //             console.log('ppppp', retrieveSession.subscription)
    //             await this.userModel.updateOne({ _id: retrieveSession.metadata.user_id }, { subscription_status: true, subscription_plan_id: retrieveSession.metadata.price_id, subscription_id: retrieveSession.subscription, profile_status: ConstantValues.PROFILE_STATUS_1 });
    //             return {}
    //         }
    //         else {
    //             return false
    //             // res.render('checkoutSessionCancel');    
    //         }

    //         // return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, null, HttpStatus.OK);
    //     }
    //     catch (error) {
    //         console.error('Error creating user:', error);
    //         return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    // async cancelUrl() {
    //     try {
    //         return true
    //         // this.res.render('checkoutSessionCancel');

    //         // return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, null, HttpStatus.OK);
    //     }
    //     catch (error) {
    //         console.error('Error creating user:', error);
    //         return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async updateVendorPersonalInfo(updateVendorDto: UpdateVendorDto, currentUser: any) {
        try {
            // const { first_name, last_name, dial_code, phone, street, city, state, zip, country } = updateVendorDto;
            if (currentUser.user_type === 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            if (currentUser.user_type === 'vendor' && currentUser.subscription_status === false) {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_REQUIRED, null, HttpStatus.BAD_REQUEST);
            }

            if (currentUser.profile_status !== ConstantValues.PROFILE_STATUS_1) {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, { profile_status: currentUser.profile_status }, HttpStatus.BAD_REQUEST);
            }

            const keys = ['first_name', 'last_name', 'dial_code', 'phone_number', 'address', 'longitude', 'latitude'];
            const objToUpdate = {};

            // for (const key of keys) {
            //     if (updateUserDto[key] != null) {
            //         objToUpdate[key] = updateUserDto[key]
            //     }
            // }

            let longitude = null;
            let latitude = null;

            for (const key of keys) {
                if (updateVendorDto[key] != null) {
                    if (key === 'longitude') {
                        longitude = updateVendorDto[key];
                        objToUpdate[key] = updateVendorDto[key];
                    }
                    else if (key === 'latitude') {
                        latitude = updateVendorDto[key];
                        objToUpdate[key] = updateVendorDto[key];
                    }
                    else {
                        objToUpdate[key] = updateVendorDto[key];
                    }
                }
            }

            if (longitude != null && latitude != null) {
                objToUpdate['location'] = {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                };
            }

            // objToUpdate['profile_status'] = currentUser['profile_status'] === 2 || currentUser['profile_status'] === 3 ? currentUser['profile_status'] : 1;

            objToUpdate['profile_status'] = currentUser['profile_status'] === 1 ? 2 : currentUser['profile_status'];
            const updateUser = await this.userModel.findByIdAndUpdate({ _id: currentUser?._id }, objToUpdate, { new: true });


            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, updateUser, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateVendorBussinessInfo(createVendorProfileDto: CreateVendorProfileDto, currentUser: any) {
        try {
            const { bussiness_name, fein, category_id, category_name } = createVendorProfileDto;

            if (currentUser.user_type === 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            if (currentUser.user_type === 'vendor' && currentUser.subscription_status === false) {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_REQUIRED, null, HttpStatus.BAD_REQUEST);
            }

            if (currentUser.profile_status !== ConstantValues.PROFILE_STATUS_2) {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, { profile_status: currentUser.profile_status }, HttpStatus.BAD_REQUEST);
            }

            const findVendorProfile = await this.vendorProfileModel.findOne({ vendor_user_id: currentUser._id });
            if (findVendorProfile) {
                return new ResponseError(ResponseMessage.PROFILE_ALREADY_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const servicePayload = { category_id: new mongoose.Types.ObjectId(category_id), category_name, is_default: true }
            const refVendorProfileData = {
                vendor_user_id: currentUser._id,
                bussiness_name,
                fein,
                services: [servicePayload]
            }

            //
            const subscriptionItem1 = await this.Stripe.subscriptionItems.create({
                subscription: currentUser?.subscription_id,
                price: process.env.SERVICE_PRICE_25 || 'price_1QWWjfCtaC1fmjOuMInJaWds',
                quantity: 0,
            });
            //

            const servicePayload1 = { category_id: new mongoose.Types.ObjectId(category_id), category_name  }
            const payload1 = {
                vendor_user_id: currentUser._id,
                subscription_id: currentUser.subscription_id,
                price_id: process.env.SERVICE_PRICE_25 || 'price_1QWWjfCtaC1fmjOuMInJaWds',
                item_id: subscriptionItem1.id,
                services: [servicePayload1],
                service_type: 'category',
                amount: 25.00
            }
            await this.serviceModel.create(payload1);

            //team
            const subscriptionItem2 = await this.Stripe.subscriptionItems.create({
                subscription: currentUser?.subscription_id,
                price: process.env.SERVICE_PRICE_15 || 'price_1QWzf0CtaC1fmjOuk9XInrY8',
                quantity: 0,
            });

            // const userPayload = { user_id: currentUser._id, first_name: currentUser.first_name, last_name: currentUser.last_name }
            const payload2 = {
                vendor_user_id: currentUser._id,
                subscription_id: currentUser.subscription_id,
                price_id: process.env.SERVICE_PRICE_15 || 'price_1QWzf0CtaC1fmjOuk9XInrY8',
                item_id: subscriptionItem2.id,
                // users: [userPayload],
                users: [],
                service_type: 'user',
                amount: 15.00
            }
            await this.serviceModel.create(payload2);

            const createVendorProfile = await this.vendorProfileModel.create(refVendorProfileData);

            const profile_status = currentUser['profile_status'] === ConstantValues.PROFILE_STATUS_2 ? ConstantValues.PROFILE_STATUS_3 : currentUser['profile_status'];
            await this.userModel.updateOne({ _id: currentUser?._id }, { profile_status: profile_status });

            const createAccount = await this.Stripe.accounts.create({
                country: 'US',
                email: currentUser.email,
                controller: {
                    stripe_dashboard: {
                        type: 'none',
                    },
                },
                capabilities: {
                    card_payments: {
                        requested: true,
                    },
                    transfers: {
                        requested: true,
                    },
                },
            });

            await this.vendorProfileModel.updateOne({ _id: createVendorProfile._id }, { destination_account: createAccount?.id });

            return new ResponseSuccess(ResponseMessage.PROFILE_SUCCESS, createVendorProfile, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async vendorProfileData(currentUser: any) {
        try {

            const vendor = await this.userModel.aggregate(
                [
                    {
                        $match: {
                            _id: currentUser._id
                        }
                    },
                    {
                        $lookup: {
                            from: 'vendorprofiles',
                            localField: '_id',
                            foreignField: 'vendor_user_id',
                            as: 'profileData'
                        }
                    }
                ]
            );

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, vendor, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createConnectAccount(currentUser: any) {
        try {
            if (currentUser.user_type === 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            if (currentUser.user_type === 'vendor' && currentUser.subscription_status === false) {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_REQUIRED, null, HttpStatus.BAD_REQUEST);
            }

            if (currentUser.profile_status !== ConstantValues.PROFILE_STATUS_3) {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, { profile_status: currentUser.profile_status }, HttpStatus.BAD_REQUEST);
            }

            const findVendorProfile = await this.vendorProfileModel.findOne({ vendor_user_id: currentUser._id });
            if (!findVendorProfile) {
                return new ResponseError(ResponseMessage.PROFILE_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            // Ensure connectAccount is properly assigned
            let connectAccount: string;
            if (findVendorProfile.destination_account) {
                connectAccount = findVendorProfile.destination_account;
            } else {
                const createAccount = await this.Stripe.accounts.create({ type: "standard" });
                if (createAccount) {
                    connectAccount = createAccount.id; // Assign the created account ID
                    await this.vendorProfileModel.updateOne({ _id: findVendorProfile._id }, { destination_account: connectAccount });
                } else {
                    return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }

            // Now create the account link
            const createLinkAccount = await this.Stripe.accountLinks.create({
                account: connectAccount, // Ensure this is defined
                refresh_url: `${process.env.API_BASE_URL}/vendor/refresh-url/${currentUser._id}`,
                return_url: `${process.env.API_BASE_URL}/vendor/return-url/${currentUser._id}`,
                type: 'account_onboarding',
            });

            if (createLinkAccount) {
                return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, createLinkAccount, HttpStatus.OK);
            }
        } catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refreshURL(user_id: string): Promise<string | ResponseError> {
        try {
            console.log('User ID:', user_id);

            const findVendorProfile = await this.vendorProfileModel.findOne({ vendor_user_id: new mongoose.Types.ObjectId(user_id) });

            if (!findVendorProfile || !findVendorProfile.destination_account) {
                console.error('Vendor profile or Stripe account not found');
                return new ResponseError(ResponseMessage.PROFILE_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const connectAccount = findVendorProfile.destination_account;

            console.log('Stripe Connect Account:', connectAccount);

            const createLinkAccount = await this.Stripe.accountLinks.create({
                account: connectAccount,
                refresh_url: `${process.env.API_BASE_URL}/vendor/refresh-url/${user_id}`,
                return_url: `${process.env.API_BASE_URL}/vendor/return-url/${user_id}`,
                type: 'account_onboarding'
            });

            if (createLinkAccount) {
                return createLinkAccount.url;
            }
        } catch (error) {
            console.error('Error creating Stripe account link:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async returnURL(user_id: string): Promise<{ url: string } | ResponseError> {
        try {
            // Find vendor profile
            const findVendorProfile = await this.vendorProfileModel.findOne({ vendor_user_id: new mongoose.Types.ObjectId(user_id) });
            if (!findVendorProfile || !findVendorProfile.destination_account) {
                console.error('Vendor profile or Stripe account not found');
                return new ResponseError(ResponseMessage.PROFILE_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            // Retrieve the updated Stripe account information
            const stripeAccount = await this.Stripe.accounts.retrieve(findVendorProfile.destination_account);
            console.log('here11', stripeAccount)
            // Check if the account is verified or has a status that meets your requirements
            if (stripeAccount.details_submitted /*&& stripeAccount.charges_enabled*/) {
                // Update profile status if needed
                console.log('here00')
                await this.userModel.updateOne(
                    { _id: new mongoose.Types.ObjectId(user_id) },
                    { profile_status: ConstantValues.PROFILE_STATUS_4 } // example status, e.g., 'onboarding completed'
                );

                await this.vendorProfileModel.updateOne(
                    { _id: findVendorProfile._id },
                    { stripe_connect_account_status: true } // example status, e.g., 'onboarding completed'
                );

                return { url: `${process.env.APP_BASE_URL}/dashboard` };
            }
            else {
                return { url: `${process.env.APP_BASE_URL}/vendor/info` };
            }
        } catch (error) {
            console.error('Error handling return URL:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createVendorSubscription(createSubscriptionDto: CreateSubscriptionDto, currentUser: any) {
        try {

            const { price_id } = createSubscriptionDto;

            if (currentUser.user_type === 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            if (currentUser.user_type === 'vendor' && currentUser.subscription_status === true) {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_ALREADY_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const createSubscription = await this.Stripe.subscriptions.create({
                customer: currentUser.customer_id, // Existing Stripe customer ID
                items: [{ price: price_id }], // Stripe price ID
                payment_behavior: 'default_incomplete',
                expand: ['latest_invoice.payment_intent'],
                metadata: {
                    user_id: currentUser._id.toString(), // Attach custom data
                    price_id: price_id.toString(), // Price ID for reference,
                    // amount: 40
                },
            });

            if (createSubscription) {
                return new ResponseSuccess(ResponseMessage.SUBSCRIPTION_SUCCESS, createSubscription, HttpStatus.OK);
            }
        }
        catch (error) {
            console.error('Error creating subscription:', error);

            // if (error.type === 'StripeInvalidRequestError') {
            //     return new ResponseError(ResponseMessage.STRIPE_INVALID_REQUEST, error.message, HttpStatus.BAD_REQUEST);
            // } else if (error.type === 'StripeAPIError') {
            //     return new ResponseError(ResponseMessage.STRIPE_API_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // } else if (error.type === 'StripeConnectionError') {
            //     return new ResponseError(ResponseMessage.STRIPE_CONNECTION_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // } else if (error.type === 'StripeAuthenticationError') {
            //     return new ResponseError(ResponseMessage.STRIPE_AUTH_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // } else if (error.type === 'StripeCardError') {
            //     return new ResponseError(ResponseMessage.STRIPE_CARD_ERROR, error.message, HttpStatus.PAYMENT_REQUIRED);
            // } else {
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // }
        }
    }

    async updateSubscriptionData(updateSubscriptionDto: UpdateSubscriptionDto, currentUser: any) {
        try {
            const { subscription_id } = updateSubscriptionDto;

            const retrieveSubscription = await this.Stripe.subscriptions.retrieve(subscription_id);
            console.log('ppp', retrieveSubscription.status)

            if (retrieveSubscription && retrieveSubscription?.status === 'active') {
                if (currentUser.subscription_status === true) {
                    return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, null, HttpStatus.OK);
                }

                const refUserData = {
                    profile_status: ConstantValues.PROFILE_STATUS_1,
                    subscription_id: retrieveSubscription.id,
                    subscription_plan_id: retrieveSubscription['plan'].id,
                    subscription_status: true
                }

                const refData = {
                    vendor_user_id: currentUser._id,
                    subscription_id: retrieveSubscription.id,
                    customer_id: currentUser.customer_id,
                    price_id: retrieveSubscription['plan'].id,
                    start_date: retrieveSubscription.start_date,
                    status: 'active'
                }

                await this.vendorSubsModel.create(refData);
                await this.vendorTransactionModel.create(refData);
                await this.userModel.updateOne({ _id: currentUser?._id }, refUserData);

                return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, null, HttpStatus.OK);
            }
            else {
                const refTransactonData = {
                    vendor_user_id: currentUser._id,
                    subscription_id: retrieveSubscription.id,
                    customer_id: currentUser.customer_id,
                    price_id: retrieveSubscription['plan'].id,
                    status: retrieveSubscription.status
                }

                await this.vendorTransactionModel.create(refTransactonData);

                return new ResponseError(ResponseMessage.SUBSCRIPTION_ERROR, null, HttpStatus.BAD_REQUEST);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeVendorSubscription(createSubscriptionDto: CreateSubscriptionDto, currentUser: any) {
        try {
            const { price_id } = createSubscriptionDto;
            console.log('pppppreqqqqqqqqq', currentUser?.subscription_plan_id, price_id)
            if (currentUser.user_type === 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            if (currentUser.user_type === 'vendor' && currentUser?.subscription_plan_id === price_id) {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_DUPLICATE_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const subscription = await this.Stripe.subscriptions.retrieve(currentUser?.subscription_id);
            const subscriptionItemId = subscription?.items?.data[0]?.id;
            if (!subscriptionItemId) {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
            }

            const updatedSubscription = await this.Stripe.subscriptions.update(currentUser.subscription_id, {
                items: [{
                    id: subscriptionItemId,
                    price: price_id,
                }],
                proration_behavior: 'create_prorations',
            });

            if (updatedSubscription) {
                const refUserData = {
                    subscription_id: subscription.id,
                    subscription_plan_id: price_id,
                    subscription_status: true
                }

                const refData = {
                    vendor_user_id: currentUser._id,
                    subscription_id: subscription.id,
                    customer_id: currentUser.customer_id,
                    price_id: price_id,
                    start_date: subscription.start_date,
                    status: 'active'
                }

                await this.vendorSubsModel.create(refData);
                await this.vendorTransactionModel.create(refData);
                await this.userModel.updateOne({ _id: currentUser?._id }, refUserData);
                return new ResponseSuccess(ResponseMessage.SUBSCRIPTION_SUCCESS, updatedSubscription, HttpStatus.OK);
            }
            else {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_FAILED, null, HttpStatus.BAD_REQUEST);
            }
        }
        catch (error) {
            console.error('Error creating subscription:', error);

            // if (error.type === 'StripeInvalidRequestError') {
            //     return new ResponseError(ResponseMessage.STRIPE_INVALID_REQUEST, error.message, HttpStatus.BAD_REQUEST);
            // } else if (error.type === 'StripeAPIError') {
            //     return new ResponseError(ResponseMessage.STRIPE_API_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // } else if (error.type === 'StripeConnectionError') {
            //     return new ResponseError(ResponseMessage.STRIPE_CONNECTION_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // } else if (error.type === 'StripeAuthenticationError') {
            //     return new ResponseError(ResponseMessage.STRIPE_AUTH_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // } else if (error.type === 'StripeCardError') {
            //     return new ResponseError(ResponseMessage.STRIPE_CARD_ERROR, error.message, HttpStatus.PAYMENT_REQUIRED);
            // } else {
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // }
        }
    }

    async retrieveVendorSubscription(currentUser: any) {
        try {
            if (currentUser.user_type !== 'vendor' && currentUser?.subscription_status === false) {
                return new ResponseError(ResponseMessage.NO_ACTIVE_SUBSCRIPTION_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const subscription = await this.Stripe.subscriptions.retrieve(currentUser?.subscription_id);
            const subscriptionItemId = subscription?.items?.data[0]?.id;
            if (!subscriptionItemId) {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
            }

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, subscription, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating subscription:', error);

            // if (error.type === 'StripeInvalidRequestError') {
            //     return new ResponseError(ResponseMessage.STRIPE_INVALID_REQUEST, error.message, HttpStatus.BAD_REQUEST);
            // } else if (error.type === 'StripeAPIError') {
            //     return new ResponseError(ResponseMessage.STRIPE_API_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // } else if (error.type === 'StripeConnectionError') {
            //     return new ResponseError(ResponseMessage.STRIPE_CONNECTION_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // } else if (error.type === 'StripeAuthenticationError') {
            //     return new ResponseError(ResponseMessage.STRIPE_AUTH_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // } else if (error.type === 'StripeCardError') {
            //     return new ResponseError(ResponseMessage.STRIPE_CARD_ERROR, error.message, HttpStatus.PAYMENT_REQUIRED);
            // } else {
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
            // }
        }
    }

    async vendorHomeData(currentUser: any) {
        try {
            const resData = await this.jobActionModel.aggregate([
                {
                    $match: {
                        vendor_user_id: currentUser._id,
                        status: { $ne: 'vendor_reject' }
                    }
                },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'job_id',
                        foreignField: '_id',
                        as: 'jobData',
                        pipeline: [
                            // {
                            //     $lookup: {
                            //         from: 'users',
                            //         localField: 'client_user_id',
                            //         foreignField: '_id',
                            //         as: 'clientUserData'
                            //     }
                            // },
                        ]
                    }
                },
                {
                    $facet: {
                        openCount: [
                            {
                                $match: {
                                    'jobData.status': 'active'
                                }
                            },
                            { $count: "count" }
                        ],
                        pendingCount: [
                            {
                                $match: {
                                    'jobData.status': 'pending'
                                }
                            },
                            { $count: "count" }
                        ],
                        closedCount: [
                            {
                                $match: {
                                    'jobData.status': 'closed'
                                }
                            },
                            { $count: "count" }
                        ],
                        jobData: [
                            { $sort: { _id: -1 } },
                            { $limit: 4 }
                        ]
                    }
                },
                {
                    $project: {
                        openJobsCount: { $arrayElemAt: ["$openCount.count", 0] },
                        pendingJobsCount: { $arrayElemAt: ["$pendingCount.count", 0] },
                        closedJobsCount: { $arrayElemAt: ["$closedCount.count", 0] },
                        jobData: 1
                    }
                }
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, resData, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async vendorJobListingAndFilter(jobListingDto: JobListingDto, currentUser: any) {
        try {
            const { input_page = 1, open_filter, pending_filter, completed_filter, input_search, start_date, end_date, service_filter } = jobListingDto;

            const page = Math.max(1, +input_page); // Ensure page is at least 1
            const limit = 10;
            const skip = (page - 1) * limit;

            // Initialize filter conditions
            const filterCondition: any = {
                vendor_user_id: currentUser._id,
                $or: [
                    { status: ConstantValues.JOB_STATUS_VENDOR_ACCEPT },
                    { status: ConstantValues.JOB_STATUS_CLIENT_CONFIRM },
                    { status: ConstantValues.JOB_STATUS_VENDOR_CLOSED },
                    { status: ConstantValues.JOB_STATUS_CLIENT_CLOSED }
                ]
            }

            console.log('oooo', filterCondition)
            const resData = await this.jobActionModel.aggregate([
                {
                    $match: filterCondition
                },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'job_id',
                        foreignField: '_id',
                        as: 'jobData',
                        pipeline: [
                            {
                                $match: {
                                    ...(open_filter === 'true' ? { status: 'active' } : {}),
                                    ...(pending_filter === 'true' ? { status: 'pending' } : {}),
                                    ...(completed_filter === 'true' ? { status: 'closed' } : {}),
                                    ...input_search ? { name: { $regex: `^${input_search}`, $options: 'i' } } : {},
                                    ...(service_filter ? { category_id: new mongoose.Types.ObjectId(service_filter) } : {}),
                                    ...(start_date || end_date ? {
                                        createdAt: {
                                            ...(start_date ? { $gte: new Date(new Date(start_date).setHours(0, 0, 0, 0)) } : {}),
                                            ...(end_date ? { $lt: new Date(new Date(end_date).setHours(24, 0, 0, 0)) } : {})
                                        }
                                    } : {})
                                }
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'client_user_id',
                                    foreignField: '_id',
                                    as: 'clientUserData'
                                }
                            },
                        ]
                    }
                },
                {
                    $unwind: '$jobData'
                },
                {
                    $facet: {
                        jobsData: [
                            {
                                $replaceRoot: {
                                    newRoot: '$jobData'
                                }
                            },
                            { $sort: { _id: -1 } },
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        jobsCount: [
                            {
                                $group: {
                                    _id: null,
                                    totalJobs: {
                                        $sum: 1
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        jobsData: 1,
                        totalJobCount: {
                            $ifNull: [{
                                $arrayElemAt: ['$jobsCount.totalJobs', 0]
                            }, 0]
                        }
                    }
                }
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, resData, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching job listing:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async vendorOpenJobListingAndFilter(openJobListingDto: OpenJobListingDto, currentUser: any) {
        try {
            const { input_page = 1, distance_filter, start_amount, end_amount, input_search, start_date, end_date, /*longitude, latitude, */ service_filter } = openJobListingDto;

            const page = Math.max(1, +input_page); // Ensure page is at least 1
            const limit = 10;
            const skip = (page - 1) * limit;

            // Initialize filter conditions
            const filterCondition: any = {
                // vendor_user_id: currentUser._id,
                status: 'active'
            };

            if (input_search) {
                filterCondition.$or = [
                    { name: { $regex: `^${input_search}`, $options: 'i' } }
                ];
            }

            const effectiveStartAmount = start_amount ?? 10;
            const effectiveEndAmount = end_amount ?? 4000;

            if (effectiveStartAmount || effectiveEndAmount) {
                filterCondition['budget'] = {};
                if (effectiveStartAmount) {
                    filterCondition['budget']['$gte'] = +effectiveStartAmount;
                }
                if (effectiveEndAmount) {
                    filterCondition['budget']['$lte'] = +effectiveEndAmount;
                }
            }
            
            let max_distance: number;
            if (distance_filter && distance_filter.length > 0) {
                max_distance = distance_filter[distance_filter.length - 1]
            }

            if (start_date || end_date) {
                const createdAtFilter: any = {}; // Initialize an empty object for createdAt filter
            
                if (start_date) {
                    const startDate = new Date(start_date);
                    createdAtFilter['$gte'] = new Date(startDate.setHours(0, 0, 0, 0)); // Start of the day
                }
            
                if (end_date) {
                    const endDate = new Date(end_date);
                    createdAtFilter['$lt'] = new Date(endDate.setHours(24, 0, 0, 0)); // Start of the next day
                }
            
                // Assign the createdAt filter only if it has valid conditions
                if (Object.keys(createdAtFilter).length > 0) {
                    filterCondition['createdAt'] = createdAtFilter;
                }
            }            

            if(service_filter) {
                filterCondition['category_id'] = new mongoose.Types.ObjectId(service_filter)
            }
            
            console.log('ooooooofilterCondition', filterCondition)
            const jobData = await this.jobModel.aggregate([
                // {
                //     $geoNear: {
                //         near: {
                //             type: 'Point',
                //             coordinates: [Number(longitude), Number(latitude)], // Replace with actual longitude and latitude
                //         },
                //         distanceField: 'distance', // Field to store calculated distance
                //         spherical: true, // Use spherical distance calculation
                //         maxDistance: Number(max_distance) * 1609.34 || 5000 * 1609.34, // Convert miles to meters
                //     },
                // },
                {
                    $lookup: {
                        from: 'jobactions',
                        localField: '_id',
                        foreignField: 'job_id',
                        as: 'jobActionData',
                    },
                },
                {
                    $addFields: {
                        job_taken: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gt: [{ $size: "$jobActionData" }, 0] },  // Ensure the array is not empty,
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $filter: {
                                                            input: "$jobActionData",  // Iterate over the jobActionData array
                                                            as: "item",               // Alias for each item
                                                            cond: {
                                                                $and: [
                                                                    { $eq: ["$$item.status", ConstantValues.JOB_STATUS_VENDOR_ACCEPT] },
                                                                    { $eq: ["$$item.vendor_user_id", currentUser._id] }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        } // Ensure there's at least one jobActionData item with status equal to JOB_STATUS_VENDOR_ACCEPT
                                    ]
                                },
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                {
                    $match: { ...filterCondition, 'jobActionData.status': { $ne: ConstantValues.JOB_STATUS_VENDOR_REJECT } }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'client_user_id',
                        foreignField: '_id',
                        as: 'clientUserData',
                    },
                },
                {
                    $facet: {
                        jobsData: [
                            { $sort: { _id: -1 } },
                            { $skip: skip },
                            { $limit: limit }
                        ],
                        jobsCount: [
                            {
                                $group: {
                                    _id: null,
                                    totalJobs: {
                                        $sum: 1
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        jobsData: 1,
                        totalJobCount: {
                            $ifNull: [{
                                $arrayElemAt: ['$jobsCount.totalJobs', 0]
                            }, 0]
                        }
                    }
                }
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, jobData, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error fetching job listing:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addTeamMember(addTeamMemberDto: AddTeamMemberDto, currentUser: any) {
        const session = await this.connection.startSession();
        session.startTransaction();
    
        try {
            const { first_name, last_name } = addTeamMemberDto;
            const email = addTeamMemberDto.email.toLowerCase();
    
            // Check if email already exists
            const findEmail = await this.userModel.findOne({ email }).session(session);
            if (findEmail) {
                return new ResponseError(ResponseMessage.EMAIL_ALREADY_EXIST, null, HttpStatus.BAD_REQUEST);
            }
    
            const { subscription_id, subscription_status } = currentUser;
    
            // Validate subscription status
            if (subscription_id && subscription_status === false) {
                return new ResponseError(ResponseMessage.NO_ACTIVE_SUBSCRIPTION_EXIST, null, HttpStatus.BAD_REQUEST);
            }
    
            // Prepare user data
            const refUserData = {
                first_name,
                last_name,
                email,
                login_type: 'email',
                user_type: 'vendor_child',
                parent_user_id: currentUser._id,
            };
    
            // Create and save new user
            const newUser = new this.userModel(refUserData);
            const saveUser = await newUser.save({ session });
    
            // Create Stripe customer
            const customer = await this.Stripe.customers.create({ email });
            if (customer) {
                await this.userModel.findByIdAndUpdate(
                    { _id: saveUser._id },
                    { customer_id: customer.id },
                    { session }
                );
            }
    
            // Update service model with new user
            await this.serviceModel.updateOne(
                { service_type: 'user', vendor_user_id: currentUser._id, subscription_id: currentUser.subscription_id },
                {
                    $addToSet: {
                        users: {
                            user_id: saveUser._id,
                            first_name,
                            last_name,
                        },
                    },
                },
                { session }
            );
    
            // Commit the transaction
            await session.commitTransaction();
            return new ResponseSuccess(ResponseMessage.TEAM_ADD_SUCCESS, null, HttpStatus.OK);
        } catch (error) {
            // Rollback the transaction
            await session.abortTransaction();
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            // End the session
            session.endSession();
        }
    }

    async listTeamMember(currentUser: any) {
        try {
            const teamData = await this.userModel.find({ parent_user_id: currentUser._id });
            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, teamData, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching job listing:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateTeamMember(updateTeamMemberDto: UpdateTeamMemberDto, currentUser: any) {
        try {
            const { team_member_id } = updateTeamMemberDto;

            const findTeamMember = await this.userModel.findOne({ _id: team_member_id, parent_user_id: currentUser._id });
            if (!findTeamMember) {
                return new ResponseError(ResponseMessage.USER_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const keys = ['first_name', 'last_name', 'email', 'dial_code', 'phone_number'];
            const objToUpdate = {};

            for (const key of keys) {
                if (updateTeamMemberDto[key] != null) {
                    objToUpdate[key] = updateTeamMemberDto[key]
                }
            }

            const updateUser = await this.userModel.findOneAndUpdate({ _id: findTeamMember._id }, objToUpdate, { new: true });
            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, updateUser, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteTeamMember(deleteTeamMemberDto: DeleteTeamMemberDto, currentUser: any) {
        const session = await this.connection.startSession();
        session.startTransaction();
    
        try {
            const { team_member_id } = deleteTeamMemberDto;
    
            // Check if team member exists
            const findTeamMember = await this.userModel.findOne({ _id: team_member_id, parent_user_id: currentUser._id }).session(session);
            if (!findTeamMember) {
                return new ResponseError(ResponseMessage.USER_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }
    
            const { subscription_id, subscription_status } = currentUser;
    
            // Validate subscription status
            if (subscription_id && subscription_status === false) {
                return new ResponseError(ResponseMessage.NO_ACTIVE_SUBSCRIPTION_EXIST, null, HttpStatus.BAD_REQUEST);
            }
    
            const subscription = await this.Stripe.subscriptions.retrieve(subscription_id);
            if (subscription.status !== 'active') {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_INACTIVE, null, HttpStatus.BAD_REQUEST);
            }
    
            // Find related service model
            const findData = await this.serviceModel.findOne({
                service_type: 'user',
                vendor_user_id: currentUser._id,
                subscription_id: currentUser.subscription_id,
            }).session(session);
    
            if (!findData) {
                return new ResponseError(ResponseMessage.SERVICE_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }
    
            // Validate subscription item
            const subscriptionItem = await this.Stripe.subscriptionItems.retrieve(findData?.item_id);
            if (!subscriptionItem) {
                return new ResponseError(ResponseMessage.SERVICE_ITEM_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }
    
            // Update subscription quantity
            await this.Stripe.subscriptionItems.update(subscriptionItem.id, {
                quantity: subscriptionItem.quantity - 1,
            });
    
            // Remove user from service model
            await this.serviceModel.updateOne(
                { _id: findData._id },
                {
                    $pull: {
                        users: { user_id: findTeamMember._id },
                    },
                },
                { session }
            );
    
            // Delete user from user model
            await this.userModel.deleteOne({ _id: findTeamMember._id }).session(session);
    
            // Commit transaction
            await session.commitTransaction();
    
            return new ResponseSuccess(ResponseMessage.TEAM_DELETE_SUCCESS, null, HttpStatus.OK);
        } catch (error) {
            // Rollback transaction on error
            await session.abortTransaction();
            console.error('Error deleting team member:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            // Always end session
            session.endSession();
        }
    }

    async createNotification(vendor_user_id, client_user_id, job_id) {

        const notificationPayload = {
            vendor_user_id: vendor_user_id,
            client_user_id: client_user_id,
            job_id: job_id,
            text: `This is a test notification.`
        }

        const createNotification = this.notificationModel.create(notificationPayload);
        return createNotification;
    }

    async vendorActionOnJob(jobActionDto: JobActionDto, currentUser: any) {
        try {
            const { job_id, action_type, is_insured, insurance_amount, service_fee, total_payout_amount } = jobActionDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const statusPayload = {}

            let status: string;
            if (action_type === 'accept') {
                if(is_insured === true) {
                    statusPayload['is_insured'] = true;
                    statusPayload['insurance'] = {
                        insurance_amount: insurance_amount,
                        service_fee: service_fee,
                        total_payout_amount: total_payout_amount
                    }
                }

                statusPayload['status'] = ConstantValues.JOB_STATUS_VENDOR_ACCEPT;
                statusPayload['vendor_job_accept_date'] = moment().unix(); // Correct assignment
            }
            else if (action_type === 'reject') {
                statusPayload['status'] = ConstantValues.JOB_STATUS_VENDOR_REJECT;
            }
            else {
                return new ResponseError(ResponseMessage.INVALID_ACTION, null, HttpStatus.BAD_REQUEST);
            }
            console.log('statusPayload=======>', statusPayload)
            const dupAction = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), vendor_user_id: currentUser._id });
            if (dupAction) {
                if (action_type === 'accept' && dupAction['status'] === ConstantValues.JOB_STATUS_VENDOR_ACCEPT) {
                    return new ResponseError(ResponseMessage.DUPLICATE_ACTION, null, HttpStatus.BAD_REQUEST);
                }
                if (action_type === 'reject' && dupAction['status'] === ConstantValues.JOB_STATUS_VENDOR_REJECT) {
                    return new ResponseError(ResponseMessage.DUPLICATE_ACTION, null, HttpStatus.BAD_REQUEST);
                }
                console.log('rejectaccept=======>', dupAction._id)
                await this.jobActionModel.updateOne({ _id: dupAction._id }, statusPayload);

                return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, null, HttpStatus.OK);
            }

            const refData = {
                job_id: new mongoose.Types.ObjectId(job_id),
                vendor_user_id: currentUser._id,
                client_user_id: findJob?.client_user_id,
                initial_pay_amount: findJob?.initial_pay_amt,
                total_pay_amount: findJob?.budget,
                status: statusPayload['status'],
                vendor_job_accept_date: statusPayload['vendor_job_accept_date'],
                is_insured: statusPayload['is_insured'],
                insurance: statusPayload['insurance']

            }

            await this.jobActionModel.create(refData);

            await this.createNotification(currentUser._id, findJob?.client_user_id, new mongoose.Types.ObjectId(job_id));

            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async popularServicesHome(popularServiceListingDto: PopularServiceListingDto) {
        try {
            const { longitude, latitude } = popularServiceListingDto;

            const resData = await this.userModel.aggregate([
                {
                    $match: {
                        user_type: 'vendor'
                    }
                },
                {
                    $lookup: {
                        from: 'vendorprofiles',
                        localField: '_id',
                        foreignField: 'vendor_user_id',
                        as: 'vendorProfileData',
                    }
                },
                {
                    $unwind: {
                        path: '$vendorProfileData',
                        preserveNullAndEmptyArrays: false,
                    },
                },
                {
                    $lookup: {
                        from: 'jobactions',
                        localField: '_id',
                        foreignField: 'vendor_user_id',
                        as: 'vendorJobData',
                        pipeline: [
                            {
                                $match: {
                                    status: 'confirm'   //closed
                                }
                            }
                        ]
                    }
                },
                {
                    $match: {
                        'vendorJobData': { $ne: [] }
                    }
                },
                {
                    $addFields: {
                        bookedJobCount: {
                            $size: '$vendorJobData'
                        }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: 12 }
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, resData, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addFeedback(addFeedbackClientDto: AddFeedbackClientDto, currentUser: any) {
        try {
            const { job_id, client_user_id, rating, comment } = addFeedbackClientDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), vendor_user_id: currentUser._id, client_user_id: new mongoose.Types.ObjectId(client_user_id), /*status: ConstantValues.JOB_STATUS_VENDOR_ACCEPT */ });
            if (!findData) {
                return new ResponseError(ResponseMessage.JOB_STILL_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            await this.jobActionModel.updateOne({ _id: findData._id }, { $set: { vendor_rating_to_client: rating, vendor_comment_to_client: comment, vendor_comment_to_client_date: moment().unix() } });

            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async jobDetailVendorSide(jobDetailDto: JobDetailDto, currentUser: any) {
        try {
            const { job_id } = jobDetailDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            // const jobData = await this.jobActionModel.aggregate([
            //     {
            //         $match: {
            //             job_id: new mongoose.Types.ObjectId(job_id),
            //             vendor_user_id: currentUser?._id,
            //             status: 'vendor_accept'
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: 'jobs',
            //             localField: 'job_id',
            //             foreignField: '_id',
            //             as: 'jobData'
            //         }
            //     },
            //     {
            //         $unwind: {
            //             path: "$jobData",
            //             // preserveNullAndEmptyArrays: false
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: 'users',
            //             localField: 'client_user_id',
            //             foreignField: '_id',
            //             as: 'clientUserData'
            //         }
            //     },
            //     {
            //         $unwind: {
            //             path: "$clientUserData",
            //             // preserveNullAndEmptyArrays: false
            //         }
            //     },
            //     // {
            //     //     $replaceRoot: {
            //     //         newRoot: {
            //     //             $mergeObjects: ['$jobData', { vendorUserData: "$vendorUserData" }]
            //     //         }
            //     //     }
            //     // }
            // ]);

            const jobData = await this.jobModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(job_id)
                    }
                },
                {
                    $lookup: {
                        from: 'jobactions',
                        localField: '_id',
                        foreignField: 'job_id',
                        as: 'jobActionData',
                        pipeline: [
                            {
                                $match: {
                                    vendor_user_id: currentUser?._id,
                                    $or: [
                                        { status: ConstantValues.JOB_STATUS_VENDOR_ACCEPT },
                                        { status: ConstantValues.JOB_STATUS_CLIENT_CONFIRM },
                                        { status: ConstantValues.JOB_STATUS_VENDOR_CLOSED },
                                        { status: ConstantValues.JOB_STATUS_CLIENT_CLOSED }
                                    ]
                                }
                            }
                        ]
                    }
                },
                // {
                //     $unwind: {
                //         path: "$jobActionData",
                //         preserveNullAndEmptyArrays: true
                //     }
                // },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'jobActionData.client_user_id',
                        foreignField: '_id',
                        as: 'clientUserData',
                        pipeline: [
                            {
                                $project: {
                                    password: 0
                                }
                            }
                        ]
                    }
                },
                // {
                //     $unwind: {
                //         path: "$vendorUserData",
                //         // preserveNullAndEmptyArrays: false
                //     }
                // },
                // {
                //     $replaceRoot: {
                //         newRoot: {
                //             $mergeObjects: ['$jobData', { vendorUserData: "$vendorUserData" }]
                //         }
                //     }
                // }
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'categoryData',
                        pipeline: [
                            {
                                $project: {
                                    name: 1
                                }
                            }
                        ]
                    }
                },
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, jobData[0] ?? [], HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async testStripe() {
        try {

            // const account = await this.Stripe.accounts.create({
            //     country: 'US',
            //     email: 'hello@yopmail.com',
            //     controller: {
            //       stripe_dashboard: {
            //         type: 'none',
            //       },
            //     },
            //     capabilities: {
            //       card_payments: {
            //         requested: true,
            //       },
            //       transfers: {
            //         requested: true,
            //       },
            //     },
            //   });

            // accs_secret__RKuohJIxpuW6BsXl94Pnt1mw38Mlfi84N4KXJahYxkITml9                acct_1QSFn6EPsb8xMQJf

            // const account = await this.Stripe.accountSessions.create({
            //     account: 'acct_1QSYOTComf8WFxad',
            //     components: {
            //         payments: {
            //             enabled: true,
            //             features: {
            //                 refund_management: true,
            //                 dispute_management: true,
            //                 capture_payments: true,
            //             }
            //         },
            //     }
            // });

            // const account = await this.Stripe.customers.update('cus_RLerJz9maEujwO', {
            //     invoice_settings: {
            //         default_payment_method: 'pm_1QSxu5CtaC1fmjOuHnG0FqRp',
            //     },
            // });

            // const account = await this.Stripe.paymentMethods.list({
            //     customer: 'cus_RLerJz9maEujwO',
            //     type: 'card',
            // });

            const customer = await this.Stripe.customers.retrieve('cus_RLerJz9maEujwO');

            // Fetch payment methods (cards) for the customer
            const paymentMethods = await this.Stripe.paymentMethods.list({
                customer: 'cus_RLerJz9maEujwO',
                type: 'card',
            });


            // const account = await this.Stripe.customers.retrieve('cus_RLgzcWuASyIaMv');

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, {
                customer,
                paymentMethods: paymentMethods.data,
            }, HttpStatus.OK);

            // return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, account, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createAccount(currentUser: any) {
        try {
            const createAccount = await this.Stripe.accounts.create({
                country: 'US',
                email: currentUser.email,
                controller: {
                    stripe_dashboard: {
                        type: 'none',
                    },
                },
                capabilities: {
                    card_payments: {
                        requested: true,
                    },
                    transfers: {
                        requested: true,
                    },
                },
            });

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, createAccount, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async retrieveAccountAndVerify(currentUser: any) {
        const session = await this.vendorProfileModel.startSession();
        try {
            session.startTransaction();

            let account_id: string;
            const findVendorProfile = await this.vendorProfileModel.findOne({ vendor_user_id: currentUser._id }).session(session);
            if (findVendorProfile && findVendorProfile?.destination_account) {
                account_id = findVendorProfile?.destination_account;
            } else {
                return new ResponseError(ResponseMessage.DESTINATION_AC_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
            }

            const account = await this.Stripe.accounts.retrieve(account_id);

            // Check if the account setup is complete
            if (!account.requirements.eventually_due.length && account.charges_enabled && account.payouts_enabled && account.external_accounts.data.length > 0) {

                await this.vendorProfileModel.updateOne({ vendor_user_id: currentUser._id }, { $set: { stripe_connect_account_status: true } }, { session });
                await this.userModel.updateOne({ _id: currentUser._id }, { $set: { profile_status: ConstantValues.PROFILE_STATUS_4 } }, { session });

                await session.commitTransaction();
                return new ResponseSuccess(ResponseMessage.ACCOUNT_SETUP_COMPLETE, account, HttpStatus.OK);
            }
            else {
                await session.abortTransaction();
                return new ResponseError(ResponseMessage.ACCOUNT_SETUP_INCOMPLETE, null, HttpStatus.BAD_REQUEST);
            }
        } catch (error) {
            console.error('Error fetching client home data:', error);
            await session.abortTransaction();
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            session.endSession();
        }
    }

    async createAccountSession(currentUser: any) {
        try {

            let account_id: string;
            const findVendorProfile = await this.vendorProfileModel.findOne({ vendor_user_id: currentUser._id });
            if (findVendorProfile && findVendorProfile?.destination_account) {
                account_id = findVendorProfile?.destination_account
            }
            else {
                return new ResponseError(ResponseMessage.DESTINATION_AC_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
            }

            const accountSession = await this.Stripe.accountSessions.create({
                account: account_id,
                components: {
                    // payments: {
                    //     enabled: true,
                    //     features: {
                    //         refund_management: true,
                    //         dispute_management: true,
                    //         capture_payments: true,
                    //     }
                    account_onboarding: {
                        enabled: true,
                        features: {
                            external_account_collection: true,
                        }
                    }
                }
            });

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, accountSession, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async billingHistoryVendor(currentUser: any) {
        try {
            const listInvoices = await this.Stripe.invoices.list({
                customer: currentUser?.customer_id,
                limit: 100,
                // status: 'paid'
            });

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, listInvoices, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateRandomString(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            result += chars[randomIndex];
        }
        return result;
    }

    async vendorIssue(supportJobDto: SupportJobDto, currentUser: any) {
        try {
            const { job_id, reason, message } = supportJobDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({
                job_id: new mongoose.Types.ObjectId(job_id),
                vendor_user_id: currentUser._id,
                // status: {
                //     $in: [ConstantValues.JOB_STATUS_VENDOR_ACCEPT, ConstantValues.JOB_STATUS_CLIENT_CONFIRM]
                // }
            });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACCESSIBLE, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                job_id: new mongoose.Types.ObjectId(job_id),
                client_user_id: findJobAction?.client_user_id,
                vendor_user_id: currentUser._id,
                reason,
                message,
                type: 'vendor_issue',
                ticket_id: await this.generateRandomString(),
            }

            await this.supportModel.create(refData);
            return new ResponseSuccess(ResponseMessage.JOB_REPORT_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async closeJob(closeJobDto: CloseJobDto, currentUser: any) {
        try {
            const { job_id, comment, rating } = closeJobDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const jobAction = await this.jobActionModel.findOne({
                job_id: new mongoose.Types.ObjectId(job_id),
                vendor_user_id: currentUser._id,
                status: { $in: [ConstantValues.JOB_STATUS_VENDOR_CLOSED, ConstantValues.JOB_STATUS_VENDOR_ACCEPT, ConstantValues.JOB_STATUS_CLIENT_CONFIRM] }
            });

            if (!jobAction) {
                return new ResponseError(ResponseMessage.VENDOR_CLOSE_JOB_ACTION, null, HttpStatus.BAD_REQUEST);
            }

            if (jobAction.status === ConstantValues.JOB_STATUS_VENDOR_CLOSED) {
                return new ResponseError(ResponseMessage.JOB_ALREADY_CLOSED, null, HttpStatus.BAD_REQUEST);
            }

            await this.jobActionModel.updateOne({ _id: jobAction._id }, { $set: { vendor_comment_to_client: comment, vendor_rating_to_client: rating, vendor_job_close_date: moment().unix(), status: ConstantValues.JOB_STATUS_VENDOR_CLOSED } });
            // await this.jobModel.updateOne({ _id: findData._id }, { $set: { status: 'closed' } });

            return new ResponseSuccess(ResponseMessage.JOB_CLOSE_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async enableAddOnService(addOnServiceDto: AddOnServiceDto, currentUser: any) {
        try {
            const { category_id } = addOnServiceDto;
            
            const findCategory = await this.categoryModel.findOne({ _id: category_id });
            if (!findCategory) {
                return new ResponseError(ResponseMessage.CATEGORY_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const { subscription_id, subscription_status } = currentUser;

            if (subscription_id && subscription_status === false) {
                return new ResponseError(ResponseMessage.NO_ACTIVE_SUBSCRIPTION_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const subscription = await this.Stripe.subscriptions.retrieve(subscription_id);
            if (subscription.status !== 'active') {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_INACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const subscriptionItem = await this.Stripe.subscriptionItems.create({
                subscription: currentUser?.subscription_id,
                price: process.env.SERVICE_PRICE_25 || 'price_1QWWjfCtaC1fmjOuMInJaWds',
                quantity: 1,
            });

            const servicePayload = { category_id: findCategory._id, category_name: findCategory?.name }
            const payload = {
                vendor_user_id: currentUser._id,
                subscription_id: subscription_id,
                price_id: process.env.SERVICE_PRICE_25 || 'price_1QWWjfCtaC1fmjOuMInJaWds',
                item_id: subscriptionItem.id,
                services: [servicePayload],
                service_type: 'category',
                amount: 25.00
            }
            await this.serviceModel.create(payload);

            await this.vendorProfileModel.updateOne({ vendor_user_id: currentUser._id },
                {
                    $addToSet: {
                        services: {
                            category_id: findCategory?._id,
                            category_name: findCategory?.name,
                        },
                    },
                }
            );

            return new ResponseSuccess(ResponseMessage.ADDON_SERVICE_SUCCESS, subscriptionItem, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateQuantity(updateQuantityDto: UpdateQuantityDto, currentUser: any) {
        try {
            const { api_type, category_id } = updateQuantityDto;

            const findCategory = await this.categoryModel.findOne({ _id: category_id });
            if (!findCategory) {
                return new ResponseError(ResponseMessage.CATEGORY_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const { subscription_id, subscription_status } = currentUser;

            if (subscription_id && subscription_status === false) {
                return new ResponseError(ResponseMessage.NO_ACTIVE_SUBSCRIPTION_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const subscription = await this.Stripe.subscriptions.retrieve(subscription_id);
            if (subscription.status !== 'active') {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_INACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.serviceModel.findOne({ service_type: 'category', vendor_user_id: currentUser._id, subscription_id: currentUser.subscription_id });
            if (!findData) {
                return new ResponseError(ResponseMessage.SERVICE_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const alreadyExists = findData?.services.some((service) => service.category_id === findCategory?._id.toString());
            if (alreadyExists) {
                return new ResponseError(ResponseMessage.SERVICE_ALREADY_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const subscriptionItem = await this.Stripe.subscriptionItems.retrieve(findData?.item_id);
            if (!subscriptionItem) {
                return new ResponseError(ResponseMessage.SERVICE_ITEM_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            let updatedItem;
            if (api_type == ConstantValues.TYPE_INC) {
                updatedItem = await this.Stripe.subscriptionItems.update(subscriptionItem.id, {
                    quantity: subscriptionItem.quantity + 1,
                });

                await this.serviceModel.updateOne({ _id: findData._id },
                    {
                        $addToSet: {
                            services: {
                                category_id: findCategory?._id,
                                category_name: findCategory?.name,
                                is_default: false
                            },
                        },
                    }
                );

                await this.vendorProfileModel.updateOne({ vendor_user_id: currentUser._id },
                    {
                        $addToSet: {
                            services: {
                                category_id: findCategory?._id,
                                category_name: findCategory?.name,
                            },
                        },
                    }
                );
            }
            else if (api_type == ConstantValues.TYPE_DEC) {
                updatedItem = await this.Stripe.subscriptionItems.update(subscriptionItem.id, {
                    quantity: subscriptionItem.quantity - 1,
                });

                await this.serviceModel.updateOne(
                    { _id: findData._id },
                    {
                        $pull: {
                            services: { category_id: findCategory._id },
                        },
                    }
                );

                await this.vendorProfileModel.updateOne({ vendor_user_id: currentUser._id },
                    {
                        $pull: {
                            services: { category_id: findCategory._id },
                        },
                    }
                );
            }
            else {
                return new ResponseError(ResponseMessage.INVALID_API_TYPE, null, HttpStatus.BAD_REQUEST);
            }

            // // Update the database if needed
            // await this.serviceModel.updateOne(
            //     { service_type: 'category', vendor_user_id: currentUser._id, subscription_id: currentUser.subscription_id, item_id: subscriptionItem.id },
            //     { quantity: updatedItem.quantity }
            // );

            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, null, HttpStatus.OK);
        } catch (error) {
            console.error('Error cancelling add-on service:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async vendorAddedServiceListing(currentUser: any) {
        try {
            // const findCategoryService = await this.serviceModel.findOne({
            //     service_type: 'category',
            //     vendor_user_id: currentUser._id,
            //     subscription_id: currentUser.subscription_id,
            // });

            const findCategoryService = await this.serviceModel.findOne({
                service_type: 'category',
                vendor_user_id: currentUser._id,
                subscription_id: currentUser.subscription_id,
                // "services.is_default": false // Directly match the nested field
            });

            const findUserService = await this.serviceModel.findOne({
                service_type: 'user',
                vendor_user_id: currentUser._id,
                subscription_id: currentUser.subscription_id,
            });

            if (findCategoryService || findUserService) {
                const mergeData = {
                    serviceData: findCategoryService?.services.filter((data) => data['is_default'] === false) || [],
                    userData: findUserService?.users || [],
                };
                return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, mergeData, HttpStatus.OK);
            }
            else {
                return new ResponseError(ResponseMessage.DATA_NOT_EXIST, null, HttpStatus.NOT_FOUND);
            }
        } catch (error) {
            console.error('Error fetching vendor services:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }    

    async vendorOwnCategoryList(currentUser: any) {
        try {
            const findVendorCategoryList = await this.vendorProfileModel.findOne({ vendor_user_id: currentUser._id }, { services: 1, _id: 0 });
            if (!findVendorCategoryList) {
                return new ResponseError(ResponseMessage.DATA_NOT_EXIST, null, HttpStatus.NOT_FOUND);
            }

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, findVendorCategoryList, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error fetching vendor category list:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelJobVendor(cancelJobVendorDto: CancelJobVendorDto, currentUser: any) {
        try {
            const { job_id, reason, comment } = cancelJobVendorDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), vendor_user_id: currentUser._id });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACCESSIBLE, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                vendor_job_cancel_date: moment().unix(),
                vendor_cancel_reason: reason,
                vendor_cancel_comment: comment,
                status: ConstantValues.JOB_STATUS_VENDOR_CANCEL
            }
            await this.jobActionModel.updateOne({ _id: findJobAction._id }, refData);

            return new ResponseSuccess(ResponseMessage.JOB_CANCEL_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addTeamMemberService(currentUser: any) {
        try {
            const { subscription_id, subscription_status } = currentUser;

            if (subscription_id && subscription_status === false) {
                return new ResponseError(ResponseMessage.NO_ACTIVE_SUBSCRIPTION_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const subscription = await this.Stripe.subscriptions.retrieve(subscription_id);
            if (subscription.status !== 'active') {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_INACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const subscriptionItem = await this.Stripe.subscriptionItems.create({
                subscription: currentUser?.subscription_id,
                price: process.env.SERVICE_PRICE_15 || 'price_1QWzf0CtaC1fmjOuk9XInrY8',
                quantity: 1,
            });

            // const userPayload = { user_id: currentUser._id, first_name: currentUser.first_name, last_name: currentUser.last_name }
            const payload = {
                vendor_user_id: currentUser._id,
                subscription_id: subscription_id,
                price_id: process.env.SERVICE_PRICE_15 || 'price_1QWzf0CtaC1fmjOuk9XInrY8',
                item_id: subscriptionItem.id,
                // users: [userPayload],
                users: [],
                service_type: 'user',
                amount: 15.00
            }
            await this.serviceModel.create(payload);
            return new ResponseSuccess(ResponseMessage.TEAM_SERVICE_SUCCESS, subscriptionItem, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addTeamUpdateQuantity(currentUser: any) {
        try {
            const { subscription_id, subscription_status } = currentUser;

            if (subscription_id && subscription_status === false) {
                return new ResponseError(ResponseMessage.NO_ACTIVE_SUBSCRIPTION_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const subscription = await this.Stripe.subscriptions.retrieve(subscription_id);
            if (subscription.status !== 'active') {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_INACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.serviceModel.findOne({ service_type: 'user', vendor_user_id: currentUser._id, subscription_id: currentUser.subscription_id });
            if (!findData) {
                return new ResponseError(ResponseMessage.SERVICE_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const subscriptionItem = await this.Stripe.subscriptionItems.retrieve(findData?.item_id);
            if (!subscriptionItem) {
                return new ResponseError(ResponseMessage.SERVICE_ITEM_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const updatedItem = await this.Stripe.subscriptionItems.update(subscriptionItem.id, {
                quantity: subscriptionItem.quantity + 1,
            });


            // // Update the database if needed
            // await this.serviceModel.updateOne(
            //     { service_type: 'user', vendor_user_id: currentUser._id, subscription_id: currentUser.subscription_id, item_id: subscriptionItem.id },
            //     { quantity: updatedItem.quantity }
            // );

            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, null, HttpStatus.OK);
        } catch (error) {
            console.error('Error cancelling add-on service:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async editJobVendorSide(editJobVendorDto: EditJobVendorDto, currentUser: any) {
        try {
            const { job_id, budget, deadline, frequency } = editJobVendorDto;

            if (currentUser.user_type === 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            if (currentUser.user_type === 'vendor' && currentUser.subscription_status === false) {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_REQUIRED, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), vendor_user_id: currentUser._id });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACCESSIBLE, null, HttpStatus.BAD_REQUEST);
            }

            if (findJobAction?.edit_job_request !== 'default') {
                return new ResponseError(ResponseMessage.EDIT_JOB_REQ_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                total_pay_amount: budget,
                job_deadline: deadline,
                frequency: frequency,
                edit_job_request: 'vendor'
            }

            await this.jobActionModel.updateOne({ _id: findJobAction._id }, refData);
            return new ResponseSuccess(ResponseMessage.EDIT_REQUEST_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async approveEditJobVendorSide(jobDetailDto: JobDetailDto, currentUser: any) {
        try {
            const { job_id } = jobDetailDto;

            if (currentUser.user_type === 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            if (currentUser.user_type === 'vendor' && currentUser.subscription_status === false) {
                return new ResponseError(ResponseMessage.SUBSCRIPTION_REQUIRED, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), vendor_user_id: currentUser._id, edit_job_request: 'client' });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACCESSIBLE, null, HttpStatus.BAD_REQUEST);
            }

            const { total_pay_amount, frequency, job_deadline, } = findJobAction;
            //update job table field, discussion needed
            const jobPayload = {
                budget: total_pay_amount,
                frequency: frequency,
                deadline: job_deadline,
                // payment_method_id: 

            };
            await this.jobModel.updateOne({ _id: job_id }, jobPayload);

            await this.jobActionModel.updateOne({ _id: findJobAction._id }, { edit_job_request: 'default', edit_job_request_status: 'vendor_approved' });
            return new ResponseSuccess(ResponseMessage.APPROVED_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async declineEditJobVendorSide(declineEditJobVendorDto: DeclineEditJobVendorDto, currentUser: any) {
        try {
            const { job_id, reason, comment } = declineEditJobVendorDto;

            if (currentUser.user_type !== 'vendor') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), vendor_user_id: currentUser._id, edit_job_request: 'client' });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.NO_EDIT_REQUEST, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                edit_job_request: 'default',
                edit_job_request_status: 'vendor_declined',
                vendor_declined_reason: reason,
                vendor_declined_comment: comment
            }
            await this.jobActionModel.updateOne({ _id: findJobAction._id }, refData);
            return new ResponseSuccess(ResponseMessage.DECLINED_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addCommentClient(addCommentVendorDto: AddCommentVendorDto, currentUser: any) {
        try {
            const { job_id, task_id, message, image } = addCommentVendorDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.jobActionModel.findOne({
                job_id: new mongoose.Types.ObjectId(job_id), vendor_user_id: currentUser._id,
                // $or: [
                //     { status: { $ne: ConstantValues.JOB_STATUS_CLIENT_CLOSED } },
                //     { status: { $ne: ConstantValues.JOB_STATUS_VENDOR_CLOSED } },
                // ]
            });
            if (!findData) {
                return new ResponseError(ResponseMessage.JOB_ACTION_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const findJobTask = await this.jobTaskModel.findOne({ _id: new mongoose.Types.ObjectId(task_id), job_id: new mongoose.Types.ObjectId(job_id) });
            if (!findJobTask) {
                return new ResponseError(ResponseMessage.TASK_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                client_user_id: findData?.client_user_id,
                vendor_user_id: currentUser._id,
                job_id: findJob._id,
                task_id: findJobTask._id,
                comment_by: 'vendor',
                message,
                image
            }

            await this.taskCommentModel.create(refData);
            return new ResponseSuccess(ResponseMessage.COMMENT_ADD_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async revenueData(currentUser: any) {
        try {
            console.log('oooooooo')
            // const { job_id } = jobSpendDataDto; 


            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfWeek.getDate() - startOfDay.getDay()); // Adjust for the first day of the week
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear() + 1, 0, 1); // Exclusive range for the year

            const findPayments = await this.paymentLogModel.aggregate([
                {
                    $match: {
                        vendor_user_id: currentUser._id,
                        status: true,
                        createdAt: { $gte: startOfYear, $lt: endOfYear } // Restrict to the current year
                    }
                },
                {
                    $facet: {
                        currentDay: [
                            {
                                $match: { createdAt: { $gte: startOfDay } }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalAmount: { $sum: "$amount" }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    totalAmount: 1
                                }
                            }
                        ],
                        currentWeek: [
                            {
                                $match: { createdAt: { $gte: startOfWeek } }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalAmount: { $sum: "$amount" }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    totalAmount: 1
                                }
                            }
                        ],
                        currentMonth: [
                            {
                                $match: { createdAt: { $gte: startOfMonth } }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalAmount: { $sum: "$amount" }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    totalAmount: 1
                                }
                            }
                        ],
                        currentYear: [
                            {
                                $group: {
                                    _id: null,
                                    totalAmount: { $sum: "$amount" }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    totalAmount: 1
                                }
                            }
                        ]
                    }
                }
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, findPayments, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async payoutListingAndFilter(payoutListingFilterDto: PayoutListingFilterDto, currentUser: any) {
        try {
            const { input_page = 1, amount, date_filter, status_filter} = payoutListingFilterDto;

            const page = Math.max(1, +input_page); // Ensure page is at least 1
            const limit = 10;
            const skip = (page - 1) * limit;

            // Initialize filter conditions
            const filterCondition: any = {
                vendor_user_id: currentUser._id
            };

            if (amount) {
                filterCondition['amount'] = +amount;
            }

            if (date_filter) {
                const date = new Date(date_filter);
                filterCondition['createdAt'] = {
                    $gte: new Date(date.setHours(0, 0, 0, 0)), // Start of the day
                    $lt: new Date(date.setHours(24, 0, 0, 0))  // Start of the next day
                };
            }
            
            if (status_filter) {
                filterCondition['status'] = status_filter
            }
            console.log('iiiiiiii', filterCondition)

            const findPayments = await this.paymentLogModel.aggregate([
                {
                    $match: { ...filterCondition } 
                },
                {
                    $facet: {
                        // Pipeline to fetch the paginated data
                        paymentData: [
                            { 
                                $skip: skip // Apply pagination skip
                            },
                            {
                                $limit: limit // Apply pagination limit
                            }
                        ],
                        // Pipeline to cunot the total number of documents
                        totalCount: [
                            {
                                $count: "count" // Count the total number of documents
                            }
                        ]
                    }
                },
                {
                    $project: {
                        paymentData: 1, // Keep the data array
                        totalCount: { $arrayElemAt: ["$totalCount.count", 0] } // Extract the count from the totalCount array
                    }
                }
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, findPayments, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error fetching job listing:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
