import { HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Job } from 'src/schemas/job.schema';
import mongoose, { Connection, Model } from 'mongoose';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { ConstantValues, ResponseMessage } from 'src/common/constants/message';
import { CommonFunction } from '../common/helpers/common.function';
import { AddPaymentDto } from './dto/add-payment.dto';
import Stripe from 'stripe';
import { JobListingDto, PopularJobListingDto } from './dto/job-listing.dto';
import { JobDetailDto } from './dto/job-detail.dto';
import { JobAction } from 'src/schemas/job-action.schema';
import axios from 'axios';
import { AiJobApiDto } from './dto/ai-job-api.dto';
import * as AWS from 'aws-sdk';
import { AcceptJobDto } from './dto/accept-job.dto';
import { AddFeedbackVendorDto } from './dto/add-feedback-vendor.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { InitialPaymentDto } from './dto/initial-payment.dto';
import { VendorProfile } from 'src/schemas/vendor-profile.schema';
import { PaymentLog } from 'src/schemas/payment-log.schema';
import OpenAI from 'openai';
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { template } from '../common/helpers/category.prompt.list';
import { UpdateClientDto } from './dto/update-client.dto';
import * as moment from 'moment';
import { Support } from 'src/schemas/support.schema';
import { RefundRequestDto, SupportJobDto } from './dto/support-job.dto';
import { CloseJobDto } from './dto/close-job.dto';
import { EditJobClientDto } from './dto/edit-job-client.dto';
import { DeclineEditJobClientDto } from './dto/decline-edit-job-client.dto';
import { JobTask } from 'src/schemas/job-task.schema';
import { AddNewTaskDto } from './dto/add-new-job-task.dto';
import { AddCommentClientDto } from './dto/add-comment-client.dto';
import { TaskComment } from 'src/schemas/task-comment.schema';
import { TaskCommonDto } from './dto/update-task-status.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UpdateNewTaskDto } from './dto/update-new-job-task.dto';
import { CancelJobClientDto } from './dto/cancel-job-client.dto';


@Injectable()
export class ClientService {
    Stripe: Stripe;
    // private readonly s3: S3;
    private readonly s3: AWS.S3;
    private readonly logger = new Logger(ClientService.name);
    private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;

    private readonly openai: OpenAI;
    constructor(
        @InjectModel(Job.name) private jobModel: Model<Job>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(JobAction.name) private jobActionModel: Model<JobAction>,
        @InjectModel(VendorProfile.name) private vendorProfileModel: Model<VendorProfile>,
        @InjectModel(PaymentLog.name) private paymentLogModel: Model<PaymentLog>,
        @InjectModel(Support.name) private supportModel: Model<Support>,
        @InjectModel(JobTask.name) private jobTaskModel: Model<JobTask>,
        @InjectModel(TaskComment.name) private taskCommentModel: Model<TaskComment>,

        @InjectQueue('ai-image-queue') private readonly aiImageQueue: Queue,
        @InjectQueue('ai-job-task-queue') private readonly aiJobTaskQueue: Queue,

        @InjectConnection() private readonly connection: Connection,
    ) {
        this.Stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // this.s3 = new S3({
        //     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        //     secretAccessKey: process.env.AWS_S3_SECRET,
        //     region: process.env.AWS_S3_REGION,
        // });

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_S3_ACCESS_KEY, // Replace with your AWS Access Key ID
            secretAccessKey: process.env.AWS_S3_SECRET, // Replace with your AWS Secret Access Key
            region: process.env.AWS_S3_REGION, // Replace with your AWS region
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileKey = `${Date.now()}-${file.originalname}`;
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            const uploadResult = await this.s3.upload(params).promise();
            return uploadResult.Key; // S3 file URL
        } catch (error) {
            throw new Error(`Failed to upload file to S3: ${error.message}`);
        }
    }

    async updateClientPersonalInfo(updateClientDto: UpdateClientDto, currentUser: any) {
        try {
            // const { first_name, last_name, dial_code, phone, street, city, state, zip, country } = updateClientDto;

            const keys = ['first_name', 'last_name', 'dial_code', 'phone_number', 'address', 'profile_img', 'longitude', 'latitude'];
            const objToUpdate = {};

            // for (const key of keys) {
            //     if (updateUserDto[key] != null) {
            //         objToUpdate[key] = updateUserDto[key]
            //     }
            // }

            let longitude = null;
            let latitude = null;

            for (const key of keys) {
                if (updateClientDto[key] != null) {
                    if (key === 'longitude') {
                        longitude = updateClientDto[key];
                        objToUpdate[key] = updateClientDto[key];
                    }
                    else if (key === 'latitude') {
                        latitude = updateClientDto[key];
                        objToUpdate[key] = updateClientDto[key];
                    }
                    else {
                        objToUpdate[key] = updateClientDto[key];
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

            objToUpdate['profile_status'] = currentUser['profile_status'] === 0 ? 1 : currentUser['profile_status'];
            const updateUser = await this.userModel.findByIdAndUpdate({ _id: currentUser?._id }, objToUpdate, { new: true });
            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, updateUser, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // async createJob(createJobDto: CreateJobDto, currentUser: any) {
    //     try {
    //         const { name, description, category_id, budget, frequency, address_type, address, deadline, longitude, latitude } = createJobDto;
    //         // const { longitude, latitude } = createJobDto?.address;

    //         let { profile_img } = createJobDto;

    //         if (currentUser.user_type !== 'client') {
    //             return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
    //         }

    //         if (!profile_img) {
    //             // let profile_img = '1732614978019-no_image_sample.jpg';
    //             try {
    //                 const generatedImageKey = await this.aiGenerateImage(name);
    //                 if (generatedImageKey) {
    //                     profile_img = generatedImageKey;
    //                 }
    //                 else {
    //                     profile_img = '1732614978019-no_image_sample.jpg'
    //                 }
    //             } catch (error) {
    //                 return new ResponseError(ResponseMessage.IMAGE_GENERATE_ERROR, null, HttpStatus.BAD_REQUEST);
    //             }
    //         }

    //         const refJobData = {
    //             client_user_id: currentUser._id,
    //             name,
    //             description,
    //             category_id: new mongoose.Types.ObjectId(category_id),
    //             budget,
    //             frequency,
    //             address_type,
    //             address,
    //             deadline,
    //             status: 'active',
    //             // initial_pay_amt: Math.ceil(budget / 2)
    //             longitude,
    //             latitude,
    //             profile_img: profile_img,
    //             location: {
    //                 type: 'Point',
    //                 coordinates: [longitude, latitude],
    //             }
    //         };

    //         const newJob = new this.jobModel(refJobData);
    //         await newJob.save();

    //         const status = currentUser['profile_status'] === ConstantValues.PROFILE_STATUS_1 ? ConstantValues.PROFILE_STATUS_2 : currentUser['profile_status'];
    //         await this.userModel.updateOne({ _id: currentUser._id }, { profile_status: status });

    //         return new ResponseSuccess(ResponseMessage.JOB_CREATE_SUCCESS, newJob, HttpStatus.OK);
    //     }
    //     catch (error) {
    //         console.error('Error creating user:', error);
    //         return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async createJob(createJobDto: CreateJobDto, currentUser: any) {
        try {
            const { name, description, category_id, budget, frequency, address_type, address, deadline, longitude, latitude } = createJobDto;
            // const { longitude, latitude } = createJobDto?.address;

            let { profile_img } = createJobDto;

            if (currentUser.user_type !== 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            // if (!profile_img) {
            //     // let profile_img = '1732614978019-no_image_sample.jpg';
            //     try {
            //         const generatedImageKey = await this.aiGenerateImage(name);
            //         if (generatedImageKey) {
            //             profile_img = generatedImageKey;
            //         }
            //         else {
            //             profile_img = '1732614978019-no_image_sample.jpg'
            //         }
            //     } catch (error) {
            //         return new ResponseError(ResponseMessage.IMAGE_GENERATE_ERROR, null, HttpStatus.BAD_REQUEST);
            //     }
            // }

            let flag: boolean = false;
            if (!profile_img) {
                profile_img = '1732614978019-no_image_sample.jpg'
                flag = true
            }

            const refJobData = {
                client_user_id: currentUser._id,
                name,
                description,
                category_id: new mongoose.Types.ObjectId(category_id),
                budget,
                frequency,
                address_type,
                address,
                deadline,
                status: 'active',
                // initial_pay_amt: Math.ceil(budget / 2)
                longitude,
                latitude,
                profile_img: profile_img,
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                }
            };

            const newJob = new this.jobModel(refJobData);
            await newJob.save();

            const status = currentUser['profile_status'] === ConstantValues.PROFILE_STATUS_1 ? ConstantValues.PROFILE_STATUS_2 : currentUser['profile_status'];
            await this.userModel.updateOne({ _id: currentUser._id }, { profile_status: status });

            const jobQueuePayload = { job_id: newJob._id, client_user_id: currentUser._id, description: description }
            await this.aiJobTaskQueue.add('generateJobTask', jobQueuePayload);
            if (flag === true) {
                const generateImage = await this.aiImageQueue.add('generateImage', jobQueuePayload);
                console.log('generateImage pushed to queue =========================>', generateImage.name)
            }
            return new ResponseSuccess(ResponseMessage.JOB_CREATE_SUCCESS, newJob, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addClientPayment(addPaymentDto: AddPaymentDto, currentUser: any) {
        try {
            const { job_id, payment_method_id, initial_pay_amt } = addPaymentDto;

            const findJob = await this.jobModel.findById({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            // const customer = await this.Stripe.customers.create({
            //     name: `${currentUser?.first_name} ${currentUser?.last_name}`,
            //     email: currentUser?.email,
            // });

            await this.Stripe.paymentMethods.attach(payment_method_id, { customer: currentUser.customer_id });

            await this.jobModel.updateOne({ _id: job_id }, { initial_pay_amt: initial_pay_amt, payment_method_id: payment_method_id });

            const status = currentUser['profile_status'] === ConstantValues.PROFILE_STATUS_2 ? ConstantValues.PROFILE_STATUS_3 : currentUser['profile_status'];
            await this.userModel.updateOne({ _id: currentUser._id }, { profile_status: status });

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async clientHomeData(currentUser: any) {
        try {
            const [jobData, openJobsCount, pendingJobsCount, closedJobsCount] = await Promise.all([
                this.jobModel.find({ client_user_id: currentUser._id }).sort({ _id: -1 }).limit(4),
                this.jobModel.countDocuments({ client_user_id: currentUser._id, status: 'active' }),
                this.jobModel.countDocuments({ client_user_id: currentUser._id, status: 'pending' }),
                this.jobModel.countDocuments({ client_user_id: currentUser._id, status: 'closed' }),
            ]);

            const resData = {
                jobData,
                openJobsCount,
                pendingJobsCount,
                closedJobsCount,
            };

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, resData, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async clientJobListingAndFilter(jobListingDto: JobListingDto, currentUser: any) {
        try {
            const { input_page = 1, open_filter, pending_filter, completed_filter, input_search, start_date, end_date, service_filter } = jobListingDto;

            const page = Math.max(1, +input_page); // Ensure page is at least 1
            const limit = 10;
            const skip = (page - 1) * limit;

            // Initialize filter conditions
            const filterCondition: any = {
                client_user_id: currentUser._id
            };

            if (service_filter) {
                filterCondition['category_id'] = new mongoose.Types.ObjectId(service_filter)
            }

            if (input_search) {
                filterCondition.$or = [
                    { name: { $regex: input_search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), $options: 'i' } } // Search by name, case-insensitive
                    // { name: { $regex: `^${input_search}`, $options: 'i' } } // Search by name, case-insensitive
                ];
            }

            // Apply status filters
            if (open_filter === 'true') {
                filterCondition['status'] = 'active';
            } else if (pending_filter === 'true') {
                filterCondition['status'] = 'pending';
            } else if (completed_filter === 'true') {
                filterCondition['status'] = 'closed';
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
            
            // console.log('pppppppppppp', filterCondition)
            const jobData = await this.jobModel.aggregate([
                { $match: filterCondition },
                {
                    $lookup: {
                        from: 'jobactions',
                        localField: '_id',
                        foreignField: 'job_id',
                        as: 'jobActionData'
                    }
                },
                {
                    $addFields: {
                        accepted_vendor_user_id: {
                            $let: {
                                vars: {
                                    filteredJobActions: {
                                        $filter: {
                                            input: "$jobActionData",  // Iterate over the jobActionData array
                                            as: "item",               // Alias for each item
                                            cond: {
                                                $and: [
                                                    { $eq: ["$$item.status", ConstantValues.JOB_STATUS_CLIENT_CONFIRM] },
                                                    { $eq: ["$$item.client_user_id", currentUser._id] }
                                                ]
                                            }
                                        }
                                    }
                                },
                                in: {
                                    $cond: {
                                        if: { $gt: [{ $size: "$$filteredJobActions" }, 0] },
                                        then: { $arrayElemAt: ["$$filteredJobActions.vendor_user_id", 0] },
                                        else: null
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        initial_payment_status: {
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
                                                                    { $eq: ["$$item.vendor_user_id", currentUser._id] },
                                                                    { $eq: ["$$item.initial_pay_status", true] }
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
                    $addFields: {
                        vendor_job_cancel_status: {
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
                                                                    { $eq: ["$$item.status", ConstantValues.JOB_STATUS_VENDOR_CANCEL] },
                                                                    { $eq: ["$$item.client_user_id", currentUser._id] },
                                                                    // { $eq: ["$$item.initial_pay_status", true] }
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
                    $lookup: {
                        from: 'users',
                        localField: 'client_user_id',
                        foreignField: '_id',
                        as: 'clientUserData',
                        pipeline: [{ $project: { password: 0 } }]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'jobActionData.vendor_user_id',
                        foreignField: '_id',
                        as: 'vendorUserData',
                        pipeline: [{ $project: { password: 0 } }]
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'categoryData',
                        pipeline: [{ $project: { name: 1 } }]
                    }
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

    async updateJob(updateJobDto: UpdateJobDto, currentUser: any) {
        try {
            const { job_id } = updateJobDto;
            const keys = ['name', 'description', 'category_id', 'budget', 'frequency', 'address_type', 'address', 'deadline', 'initial_pay_amt', 'profile_img', 'payment_method_id', 'longitude', 'latitude'];
            const objToUpdate = {};

            let longitude = null;
            let latitude = null;

            for (const key of keys) {
                if (updateJobDto[key] != null) {
                    if (key === 'address_type' && updateJobDto[key] === 'remote') {
                        objToUpdate[key] = updateJobDto[key];
                        objToUpdate['address'] = {};
                    }
                    else if (key === 'longitude') {
                        longitude = updateJobDto[key];
                        objToUpdate[key] = updateJobDto[key];
                    }
                    else if (key === 'latitude') {
                        latitude = updateJobDto[key];
                        objToUpdate[key] = updateJobDto[key];
                    }
                    else if (key === 'category_id') {
                        objToUpdate[key] = new mongoose.Types.ObjectId(updateJobDto[key]);
                    }
                    else {
                        objToUpdate[key] = updateJobDto[key];
                    }
                }
            }

            if (longitude != null && latitude != null) {
                objToUpdate['location'] = {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                };
            }

            const updateJob = await this.jobModel.findOneAndUpdate({ client_user_id: currentUser?._id, _id: new mongoose.Types.ObjectId(job_id) }, objToUpdate, { new: true });
            // console.log('updateJob===================', updateJob)
            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, updateJob, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // async jobDetailClientSide(jobDetailDto: JobDetailDto, currentUser: any) {
    //     try {
    //         const { job_id } = jobDetailDto;
    //         console.log('oooooo', job_id, currentUser._id)
    //         const findJob = await this.jobModel.findOne({ client_user_id: currentUser?._id, _id: job_id });
    //         if (!findJob) {
    //             return new ResponseError(ResponseMessage.JOB_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
    //         }

    //         const jobData = await this.jobModel.aggregate([
    //             {
    //                 $match: {
    //                     _id: new mongoose.Types.ObjectId(job_id)
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: 'jobactions',
    //                     localField: '_id',
    //                     foreignField: 'job_id',
    //                     as: 'jobActionData',
    //                     pipeline: [
    //                         {
    //                             $match: {
    //                                 client_user_id: currentUser?._id,
    //                                 // $or: [
    //                                 //     { status: ConstantValues.JOB_STATUS_VENDOR_ACCEPT },
    //                                 //     { status: ConstantValues.JOB_STATUS_CLIENT_CONFIRM },
    //                                 //     { status: ConstantValues.JOB_STATUS_VENDOR_CLOSED },
    //                                 //     { status: ConstantValues.JOB_STATUS_CLIENT_CLOSED }
    //                                 // ]
    //                             }
    //                         }
    //                     ]
    //                 }
    //             },
    //             // {
    //             //     $unwind: {
    //             //         path: "$jobActionData",
    //             //         preserveNullAndEmptyArrays: true
    //             //     }
    //             // },
    //             {
    //                 $lookup: {
    //                     from: 'users',
    //                     localField: 'jobActionData.vendor_user_id',
    //                     foreignField: '_id',
    //                     as: 'vendorUserData',
    //                     pipeline: [
    //                         {
    //                             $project: {
    //                                 password: 0
    //                             }
    //                         }
    //                     ]
    //                 }
    //             },
    //             // {
    //             //     $unwind: {
    //             //         path: "$vendorUserData",
    //             //         // preserveNullAndEmptyArrays: false
    //             //     }
    //             // },
    //             // {
    //             //     $replaceRoot: {
    //             //         newRoot: {
    //             //             $mergeObjects: ['$jobData', { vendorUserData: "$vendorUserData" }]
    //             //         }
    //             //     }
    //             // }
    //             {
    //                 $lookup: {
    //                     from: 'categories',
    //                     localField: 'category_id',
    //                     foreignField: '_id',
    //                     as: 'categoryData',
    //                     pipeline: [
    //                         {
    //                             $project: {
    //                                 name: 1
    //                             }
    //                         }
    //                     ]
    //                 }
    //             },
    //         ]);

    //         console.log("tesssss", JSON.stringify(jobData))
    //         return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, jobData[0] ?? [], HttpStatus.OK);
    //     }
    //     catch (error) {
    //         console.error('Error creating user:', error);
    //         return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async jobDetailClientSide(jobDetailDto: JobDetailDto, currentUser: any) {
        try {
            const { job_id } = jobDetailDto;
            console.log('oooooo', job_id, currentUser._id)
            const findJob = await this.jobModel.findOne({ client_user_id: currentUser?._id, _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

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
                                    client_user_id: currentUser?._id,
                                    // $or: [
                                    //     { status: ConstantValues.JOB_STATUS_VENDOR_ACCEPT },
                                    //     { status: ConstantValues.JOB_STATUS_CLIENT_CONFIRM },
                                    //     { status: ConstantValues.JOB_STATUS_VENDOR_CLOSED },
                                    //     { status: ConstantValues.JOB_STATUS_CLIENT_CLOSED }
                                    // ]
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
                        localField: 'jobActionData.vendor_user_id',
                        foreignField: '_id',
                        as: 'vendorUserData',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'vendorprofiles',
                                    localField: '_id',
                                    foreignField: 'vendor_user_id',
                                    as: 'vendorProfileData',
                                    pipeline: [
                                        {
                                            $project: {
                                                _id: 0,
                                                bussiness_name: 1
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind:
                                {
                                    path: '$vendorProfileData',
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    password: 0
                                }
                            }
                        ]
                    }
                },
                // {
                //     $lookup: {
                //         from: 'jobtasks',
                //         localField: 'job_id',
                //         foreignField: 'jobActionData.job_id',
                //         as: 'jobTaskData',
                //         // pipeline: [
                //         //     {
                //         //         $lookup: {
                //         //             from: 'taskcomments',
                //         //             localField: '_id',
                //         //             foreignField: 'task_id',
                //         //             as: 'commentData'
                //         //         }
                //         //     }
                //         // ]
                //     }
                // },
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

            // console.log("tesssss", JSON.stringify(jobData))
            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, jobData[0] ?? [], HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addNewJob(createJobDto: CreateJobDto, currentUser: any) {
        try {
            const { name, description, category_id, budget, frequency, address_type, address, deadline, initial_pay_amt, payment_method_id, longitude, latitude } = createJobDto;
            let { profile_img } = createJobDto;
            // console.log('reqqpayload=====', createJobDto)
            if (currentUser.user_type !== 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            let flag: boolean = false;
            if (!profile_img) {
                profile_img = '1732614978019-no_image_sample.jpg'
                flag = true
            }

            const refJobData = {
                client_user_id: currentUser._id,
                name,
                description,
                category_id: new mongoose.Types.ObjectId(category_id),
                budget,
                frequency,
                address_type,
                address,
                deadline,
                status: 'active',
                initial_pay_amt,     //: Math.ceil(budget / 2)
                profile_img: profile_img,
                payment_method_id,
                longitude,
                latitude,
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                }
            };

            if (payment_method_id) {
                await this.Stripe.paymentMethods.attach(payment_method_id, { customer: currentUser.customer_id });
            }

            const newJob = new this.jobModel(refJobData);
            await newJob.save();

            const jobQueuePayload = { job_id: newJob._id, client_user_id: currentUser._id, description: description }
            await this.aiJobTaskQueue.add('generateJobTask', jobQueuePayload);
            if (flag === true) {
                const generateImage = await this.aiImageQueue.add('generateImage', jobQueuePayload);
                console.log('generateImage pushed to queue =========================>', generateImage.name)
            }
            // console.log('generateJob to queue =========================>', generateJob.name)
            return new ResponseSuccess(ResponseMessage.JOB_CREATE_SUCCESS, newJob, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async popularJobsHome(popularJobListingDto: PopularJobListingDto, currentUser: any) {
        try {
            // const { longitude, latitude } = popularJobListingDto;

            const jobData = await this.jobModel.aggregate([
                // {
                //     $geoNear: {
                //         near: {
                //             type: 'Point',
                //             coordinates: [Number(longitude), Number(latitude)], // Replace with actual longitude and latitude
                //         },
                //         distanceField: 'distance', // Field to store calculated distance
                //         spherical: true, // Use spherical distance calculation
                //         maxDistance: 5000 * 1609.34, // Convert miles to meters
                //         // maxDistance: Number(distance_filter) * 1609.34 || 5000 * 1609.34,
                //     },
                // },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'client_user_id',
                        foreignField: '_id',
                        as: 'clientUserData',
                    },
                },
                { $sort: { _id: -1 } },
                { $limit: 8 }
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, jobData, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async jobVendorListing(jobDetailDto: JobDetailDto, currentUser: any) {
        try {
            const { job_id } = jobDetailDto;

            const findJob = await this.jobModel.findById({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            // const resData = await this.jobModel.aggregate([
            //     {
            //         $match: {
            //             _id: new mongoose.Types.ObjectId(job_id)
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: 'jobactions',
            //             localField: '_id',
            //             foreignField: 'job_id',
            //             as: 'jobActionData',    //client_rating_to_vendor
            //             pipeline: [
            //                 {
            //                     $match: {
            //                         status: "vendor_accept"
            //                     }
            //                 },
            //                 {
            //                     $lookup: {
            //                         from: 'users',
            //                         localField: 'vendor_user_id',
            //                         foreignField: '_id',
            //                         as: 'vendorUserData',
            //                         pipeline: [
            //                             {
            //                                 $project: {
            //                                     password: 0
            //                                 }
            //                             }
            //                         ]
            //                     }
            //                 }
            //             ]
            //         }
            //     },
            //     // {
            //     //     $addFields: {
            //     //         total_rating: {
            //     //             $ifNull: [{
            //     //                 $avg: '$jobActionData.client_rating_to_vendor'
            //     //             }, 0]
            //     //         }
            //     //     }
            //     // }
            // ]);

            const resData = await this.jobModel.aggregate([
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
                        as: 'jobActionData',    //client_rating_to_vendor
                        pipeline: [
                            {
                                $match: {
                                    status: "vendor_accept"
                                }
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'vendor_user_id',
                                    foreignField: '_id',
                                    as: 'vendorUserData',
                                    pipeline: [
                                        {
                                            $lookup: {
                                                from: 'vendorprofiles',
                                                localField: '_id',
                                                foreignField: 'vendor_user_id',
                                                as: 'vendorProfileData',
                                                pipeline: [
                                                    {
                                                        $project: {
                                                            _id: 0,
                                                            bussiness_name: 1
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            $unwind:
                                            {
                                                path: '$vendorProfileData',
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'jobactions',
                                                localField: '_id',
                                                foreignField: 'vendor_user_id',
                                                as: 'vendorActionData',
                                                pipeline: [
                                                    {
                                                        $addFields: {
                                                            completed_job: {
                                                                $cond: [{ $eq: ["$status", "client_closed"] }, 1, 0]
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }, 
                                        {
                                            $addFields: {
                                                total_avg_rating: { $ifNull: [{ $avg: '$vendorActionData.client_rating_to_vendor' }, 0] },
                                                total_completed_job: { $ifNull: [{ $sum: '$vendorActionData.completed_job' }, 0] }
                                            },
                                        }, 
                                        {
                                            $project: {
                                                password: 0,
                                                vendorActionData: 0
                                            }
                                        },
                                    ]
                                }
                            },
                            
                        ]
                    }
                },
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, resData, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateCategoryName(input: string) {
        const model = new ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0.7
        });

        const prompt = ChatPromptTemplate.fromTemplate(template);
        const chain = prompt.pipe(model).pipe(new StringOutputParser());
        const result = await chain.invoke({ input });
        return result
    }

    async generateJobName(aiJobApiDto: AiJobApiDto) {

        const { input } = aiJobApiDto;

        const prompt = `
            You are an AI assistant. Analyze the following job description and suggest a concise, professional job name:
            Job Description: "${input}"
            Job Name:
          `;

        try {
            const response = await this.openai.completions.create({
                model: "gpt-3.5-turbo-instruct",
                prompt: prompt,
                max_tokens: 10,
                temperature: 0.3,
            });

            let jobName = response?.choices?.[0]?.text?.trim() || 'No Name Suggested';
            console.log('Generated Job Name:', jobName);

            if (jobName.startsWith('"') && jobName.endsWith('"')) {
                jobName = jobName.slice(1, -1); // Remove leading and trailing quotes
            }

            const result = await this.generateCategoryName(input);
            console.log('1111', result)
            const cleanedResult = result.match(/\[.*\]/)?.[0];
            console.log('2222', cleanedResult)
            const parsedResult = JSON.parse(cleanedResult);
            console.log('3333', parsedResult)
            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, { jobName: jobName ?? null, categoryName: parsedResult ?? null }, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateImage(jobName: string): Promise<string> {
        try {
            const descriptionPrompt = `A realistic, professional portrait of a ${jobName}, actively engaged in tasks specific to their profession. They are wearing appropriate work attire, reflecting the standards of their occupation. The background features tools, equipment, or a workspace relevant to their field, creating an authentic environment. Their expression is focused yet approachable, with a slight, confident smile that conveys dedication, skill, and professionalism. The image should emphasize the person in action, demonstrating expertise and commitment to their trade.`
            // Step 1: Generate Image
            const response = await this.openai.images.generate({
                model: 'dall-e-3',
                prompt: descriptionPrompt,
                n: 1,
                // size: '512x512',
                size: '1024x1024',
            });

            const imageUrl = response.data[0]?.url;
            if (!imageUrl) {
                throw new Error('Image generation failed: No URL returned');
            }

            // Step 2: Download Image Data
            const imageData = await this.downloadImage(imageUrl);

            // Step 3: Upload Image to S3
            const s3Key = `ai-generated-images/${Date.now()}.png`;
            const uploadedUrl = await this.uploadToS3(imageData, s3Key);

            return uploadedUrl;
        } catch (error) {
            console.error('Error generating or uploading image:', error);
            throw new InternalServerErrorException(
                'An error occurred while processing the image. Please try again later.',
            );
        }
    }

    private async downloadImage(url: string): Promise<Buffer> {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        } catch (error) {
            console.error('Error downloading image:', error);
            throw new InternalServerErrorException('Failed to download image');
        }
    }

    private async uploadToS3(imageData: Buffer, key: string): Promise<string> {
        try {
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME, // Replace with your S3 bucket name
                Key: key,
                Body: imageData,
                ContentType: 'image/png', // Adjust if the image type is different
            };

            const uploadResult = await this.s3.upload(params).promise();
            return uploadResult.Key; // Return the uploaded file's URL
        } catch (error) {
            console.error('Error uploading image to S3:', error);
            throw new InternalServerErrorException('Failed to upload image to S3');
        }
    }

    // async aiGenerateImage(aiJobApiDto: AiJobApiDto) {
    //     try {
    //         const { input } = aiJobApiDto;

    //         const result = await this.generateImage(input);

    //         return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, result ?? null, HttpStatus.OK);
    //     }
    //     catch (error) {
    //         console.error('Error creating user:', error);
    //         return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async aiGenerateImage(input: string) {
        try {
            // const { input } = aiJobApiDto;

            const result = await this.generateImage(input);
            return result
            // return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, result ?? null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return false
            // return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async acceptVendor(acceptJobDto: AcceptJobDto, currentUser: any) {
        try {
            const { job_id, vendor_user_id } = acceptJobDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }
            console.log('*****', acceptJobDto, currentUser._id)
            const findData = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, vendor_user_id: new mongoose.Types.ObjectId(vendor_user_id), status: ConstantValues.JOB_STATUS_VENDOR_ACCEPT });
            if (!findData) {
                return new ResponseError(ResponseMessage.DATA_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const findAndUpdateData = await this.jobActionModel.findByIdAndUpdate({ _id: findData._id }, { $set: { status: ConstantValues.JOB_STATUS_CLIENT_CONFIRM, client_job_accept_date: moment().unix() } }, { new: true });
            if (findAndUpdateData['status'] = ConstantValues.JOB_STATUS_CLIENT_CONFIRM) {
                return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, null, HttpStatus.OK);
            }
            else {
                return new ResponseError(ResponseMessage.SOMETHING_WENT_WRONG, null, HttpStatus.BAD_REQUEST);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addFeedback(addFeedbackVendorDto: AddFeedbackVendorDto, currentUser: any) {
        try {
            const { job_id, vendor_user_id, rating, comment } = addFeedbackVendorDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, vendor_user_id: new mongoose.Types.ObjectId(vendor_user_id), /*status: ConstantValues.JOB_STATUS_VENDOR_CLOSED*/ });
            if (!findData) {
                return new ResponseError(ResponseMessage.JOB_STILL_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            await this.jobActionModel.findByIdAndUpdate({ _id: findData._id }, { $set: { client_rating_to_vendor: rating, client_comment_to_vendor: comment, client_comment_to_vendor_date: moment().unix() } });

            return new ResponseSuccess(ResponseMessage.DATA_UPDATE_SUCCESS, null, HttpStatus.OK);
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
                client_user_id: currentUser._id,
                status: { $in: [ConstantValues.JOB_STATUS_CLIENT_CLOSED, ConstantValues.JOB_STATUS_VENDOR_CLOSED] }
            });

            if (!jobAction) {
                return new ResponseError(ResponseMessage.VENDOR_CLOSE_JOB_ACTION, null, HttpStatus.BAD_REQUEST);
            }

            if (jobAction.status === ConstantValues.JOB_STATUS_CLIENT_CLOSED) {
                return new ResponseError(ResponseMessage.JOB_ALREADY_CLOSED, null, HttpStatus.BAD_REQUEST);
            }

            await this.jobActionModel.updateOne({ _id: jobAction?._id }, { $set: { client_comment_to_vendor: comment, client_rating_to_vendor: rating, client_job_close_date: moment().unix(), status: ConstantValues.JOB_STATUS_CLIENT_CLOSED } });
            await this.jobModel.updateOne({ _id: jobAction?.job_id }, { $set: { status: 'closed' } });

            return new ResponseSuccess(ResponseMessage.JOB_CLOSE_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async makeInitialPayment2(initialPaymentDto: InitialPaymentDto, currentUser: any) {
        try {
            const { job_id, vendor_user_id, amount, payment_method_id } = initialPaymentDto;
            console.log('illlooo', initialPaymentDto)
            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findVendor = await this.vendorProfileModel.findOne({ vendor_user_id: new mongoose.Types.ObjectId(vendor_user_id) });
            if (!findVendor) {
                return new ResponseError(ResponseMessage.VENDOR_DATA_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, vendor_user_id: new mongoose.Types.ObjectId(vendor_user_id), status: ConstantValues.JOB_STATUS_CLIENT_CONFIRM });
            if (!findData) {
                return new ResponseError(ResponseMessage.JOB_VENDOR_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
            }

            if (!findVendor.destination_account) {
                return new ResponseError(ResponseMessage.DESTINATION_AC_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
            }

            // const result = await this.createAndCapturePaymentIntent(amount, 'USD', payment_method_id, findVendor.destination_account, currentUser.customer_id);

            // const paymentLogPayload = await this.createPaymentLogPayload(
            //     vendor_user_id,
            //     currentUser._id,
            //     job_id,
            //     result['paymentIntent'],
            //     payment_method_id,
            //     amount,
            //     'USD',
            //     result['failureReason'],
            //     result['message'],
            //     result['failureReason']
            // );

            // // if (result['status']) {
            // if (result) {
            await this.jobActionModel.updateOne({ _id: findData._id }, { initial_pay_status: true, initial_pay_amount: amount, initial_pay_date: moment().unix() });
            await this.jobModel.updateOne({ _id: findJob._id }, { status: ConstantValues.JOB_STATUS_PENDING });
            // await this.paymentLogModel.create(paymentLogPayload);
            return new ResponseSuccess(ResponseMessage.PAYMENT_SUCCESS, null, HttpStatus.OK);
            // }
            // else {
            //     console.log('res error======>>>>', result)
            //     await this.paymentLogModel.create(paymentLogPayload);
            //     return new ResponseError(ResponseMessage.PAYMENT_ERROR, null, HttpStatus.BAD_REQUEST);
            // }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async makeInitialPayment(initialPaymentDto: InitialPaymentDto, currentUser: any) {
        try {
            const { job_id, vendor_user_id, amount, payment_method_id } = initialPaymentDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }
            console.log('reqqqqqqqq', currentUser.customer_id)
            const findVendor = await this.vendorProfileModel.findOne({ vendor_user_id: new mongoose.Types.ObjectId(vendor_user_id) });
            if (!findVendor) {
                return new ResponseError(ResponseMessage.VENDOR_DATA_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, vendor_user_id: new mongoose.Types.ObjectId(vendor_user_id), status: ConstantValues.JOB_STATUS_CLIENT_CONFIRM });
            if (!findData) {
                return new ResponseError(ResponseMessage.JOB_VENDOR_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
            }

            if (!findVendor.destination_account) {
                return new ResponseError(ResponseMessage.DESTINATION_AC_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
            }

            const result = await this.createAndCapturePaymentIntent(amount, 'USD', payment_method_id, findVendor.destination_account, currentUser.customer_id, findJob.id, findJob.name);
            console.log('ttttttttttresult', result)
            const paymentLogPayload = await this.createPaymentLogPayload(
                vendor_user_id,
                currentUser._id,
                job_id,
                result['paymentIntent'],
                payment_method_id,
                amount,
                'USD',
                result['status'],
                result['message'],
                result['failureReason'],
                true
            );

            if (result['status']) {
                await this.jobActionModel.updateOne({ _id: findData._id }, { initial_pay_status: true, initial_pay_amount: amount, initial_pay_date: moment().unix() });
                await this.jobModel.updateOne({ _id: findJob._id }, { status: ConstantValues.JOB_STATUS_PENDING });
                await this.paymentLogModel.create(paymentLogPayload);
                return new ResponseSuccess(ResponseMessage.PAYMENT_SUCCESS, null, HttpStatus.OK);
            }
            else {
                console.log('res error======>>>>', result)
                await this.paymentLogModel.create(paymentLogPayload);
                return new ResponseError(ResponseMessage.PAYMENT_ERROR, null, HttpStatus.BAD_REQUEST);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createAndCapturePaymentIntent(amount: number, currency: string, paymentMethodId: string, destinationAccountId: string, customer_id: string, job_id: string, job_name: string) {
        try {
            // Step 1: Create the Payment Intent
            const paymentIntent = await this.Stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'USD',
                customer: customer_id,
                payment_method: paymentMethodId,
                confirm: true,
                capture_method: 'manual',
                transfer_data: {
                    destination: destinationAccountId,  
                },
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                },
                metadata: {
                    job_id: job_id,                
                    job_name: job_name
                }
            });

            console.log('Payment Intent created:', paymentIntent.id);

            const capturePaymentIntent = await this.Stripe.paymentIntents.capture(paymentIntent.id);
            if (capturePaymentIntent && capturePaymentIntent.status === 'succeeded') {
                return {
                    status: true,
                    message: 'Payment successful!',
                    paymentIntent: paymentIntent.id,
                    failureReason: null
                };
            }
            else {
                return {
                    status: false,
                    message: 'Payment failed!',
                    paymentIntent: paymentIntent,
                    failureReason: paymentIntent.status
                };
            }
        }
        catch (error) {
            // Handle Stripe errors
            console.error('Payment Error:', error);
            return {
                status: false,
                message: 'Internal Payment Error',
                paymentIntent: null,
                failureReason: error?.message
            };
        }
    }

    async createPaymentLogPayload(
        vendorUserId: string | mongoose.Types.ObjectId,
        clientUserId: string | mongoose.Types.ObjectId,
        jobId: string | mongoose.Types.ObjectId,
        paymentIntentId: string,
        paymentMethodId: string,
        amount: number,
        currency: string,
        status: boolean,
        description: string,
        failureReason: string | null,
        is_initial_payment: boolean
    ) {
        return {
            vendor_user_id: new mongoose.Types.ObjectId(vendorUserId),
            client_user_id: new mongoose.Types.ObjectId(clientUserId),
            job_id: new mongoose.Types.ObjectId(jobId),
            payment_intent_id: paymentIntentId,
            payment_method_id: paymentMethodId,
            amount: amount,
            currency: currency,
            status: status,
            description: description,
            failure_reason: failureReason ?? null,
            is_initial_payment: is_initial_payment
        };
    }

    async schedulePayment(initialPaymentDto: InitialPaymentDto, currentUser: any) { //working
        try {
            const { job_id, vendor_user_id, amount, payment_method_id } = initialPaymentDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findVendor = await this.vendorProfileModel.findOne({ vendor_user_id: new mongoose.Types.ObjectId(vendor_user_id) });
            if (!findVendor) {
                return new ResponseError(ResponseMessage.VENDOR_DATA_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, vendor_user_id: new mongoose.Types.ObjectId(vendor_user_id), status: ConstantValues.JOB_STATUS_CLIENT_CONFIRM });
            if (!findData) {
                return new ResponseError(ResponseMessage.JOB_VENDOR_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
            }

            if (!findVendor.destination_account) {
                return new ResponseError(ResponseMessage.DESTINATION_AC_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
            }

            const result = await this.createAndCapturePaymentIntent(amount, 'USD', payment_method_id, findVendor.destination_account, currentUser.customer_id, findJob.id, findJob.name);
            console.log('ttttttttttresult', result)
            //function
            const paymentLogPayload = await this.createPaymentLogPayload(   
                vendor_user_id,
                currentUser._id,
                job_id,
                result['paymentIntent'],
                payment_method_id,
                amount,
                'USD',
                result['status'],
                result['message'],
                result['failureReason'],
                true
            );

            if (result['status']) {
                await this.jobActionModel.updateOne({ _id: findData._id }, { initial_pay_status: true, initial_pay_amount: amount, initial_pay_date: moment().unix() });
                await this.jobModel.updateOne({ _id: findJob._id }, { status: ConstantValues.JOB_STATUS_PENDING });
                await this.paymentLogModel.create(paymentLogPayload);
                return new ResponseSuccess(ResponseMessage.PAYMENT_SUCCESS, null, HttpStatus.OK);
            }
            else {
                console.log('res error======>>>>', result)
                await this.paymentLogModel.create(paymentLogPayload);
                return new ResponseError(ResponseMessage.PAYMENT_ERROR, null, HttpStatus.BAD_REQUEST);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async clientOwnCategoryList(currentUser: any) {
        try {
            const findClientServiceList = await this.jobModel.aggregate([
                {
                    $match: {
                        client_user_id: currentUser._id,
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'categoryData',
                    },
                },
                {
                    $unwind: {
                        path: '$categoryData',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $group: {
                        _id: '$category_id',
                        services: { $first: '$categoryData' }, // Take first categoryData for each category_id
                    },
                },
                {
                    $project: {
                        _id: 0,
                        'category_id': '$services._id',
                        'category_name': '$services.name',
                    },
                },
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, findClientServiceList, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async reportVendor(jobDetailDto: JobDetailDto, currentUser: any) {
        try {
            const { job_id } = jobDetailDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), vendor_user_id: currentUser._id, status: ConstantValues.JOB_STATUS_VENDOR_ACCEPT });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACCESSIBLE, null, HttpStatus.BAD_REQUEST);
            }

            await this.jobActionModel.updateOne({ _id: findJobAction._id }, { $set: { status: ConstantValues.JOB_STATUS_VENDOR_CANCEL } });
            return new ResponseSuccess(ResponseMessage.JOB_CANCEL_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async acceptedVendorUserForJob(jobDetailDto: JobDetailDto, currentUser: any) {
        try {
            const { job_id } = jobDetailDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, status: ConstantValues.JOB_STATUS_CLIENT_CONFIRM });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.JOB_NOT_CONFIRMED, null, HttpStatus.BAD_REQUEST);
            }

            const resData = {
                job_id: job_id,
                vendor_user_id: findJobAction?.vendor_user_id,
                status: findJobAction?.status
            }
            return new ResponseSuccess(ResponseMessage.JOB_CANCEL_SUCCESS, resData, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
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

    async reportJob(supportJobDto: SupportJobDto, currentUser: any) {
        try {
            const { job_id, reason, message } = supportJobDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({
                job_id: new mongoose.Types.ObjectId(job_id),
                client_user_id: currentUser._id,
                // status: {
                //     $in: [ConstantValues.JOB_STATUS_VENDOR_ACCEPT, ConstantValues.JOB_STATUS_CLIENT_CONFIRM]
                // }
            });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.JOB_ACTION_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const findReport = await this.supportModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id });
            if (findReport) {
                return new ResponseError(ResponseMessage.JOB_ALREADY_REPORTED, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                job_id: new mongoose.Types.ObjectId(job_id),
                client_user_id: currentUser._id,
                vendor_user_id: findJobAction?.vendor_user_id,
                reason,
                message,
                type: 'report_job',
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

    async customerIssue(supportJobDto: SupportJobDto, currentUser: any) {
        try {
            const { job_id, reason, message } = supportJobDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({
                job_id: new mongoose.Types.ObjectId(job_id),
                client_user_id: currentUser._id,
                // status: {
                //     $in: [ConstantValues.JOB_STATUS_VENDOR_ACCEPT, ConstantValues.JOB_STATUS_CLIENT_CONFIRM]
                // }
            });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.JOB_ACTION_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                job_id: new mongoose.Types.ObjectId(job_id),
                client_user_id: currentUser._id,
                vendor_user_id: findJobAction?.vendor_user_id,
                reason,
                message,
                type: 'customer_issue',
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

    async requestRefund(refundRequestDto: RefundRequestDto, currentUser: any) {
        try {
            const { job_id, reason, message, refund_sum } = refundRequestDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({
                job_id: new mongoose.Types.ObjectId(job_id),
                client_user_id: currentUser._id,
                // status: {
                //     $in: [ConstantValues.JOB_STATUS_VENDOR_ACCEPT, ConstantValues.JOB_STATUS_CLIENT_CONFIRM]
                // }
            });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.JOB_ACTION_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                job_id: new mongoose.Types.ObjectId(job_id),
                client_user_id: currentUser._id,
                vendor_user_id: findJobAction?.vendor_user_id,
                reason,
                message,
                refund_sum,
                type: 'refund_request',
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

    async editJobClientSide(editJobClientDto: EditJobClientDto, currentUser: any) {
        try {
            const { job_id, budget, deadline, frequency, payment_method_id } = editJobClientDto;

            if (currentUser.user_type === 'vendor') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id });
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
                payment_method_id: payment_method_id,
                edit_job_request: 'client'
            }

            await this.jobActionModel.updateOne({ _id: findJobAction._id }, refData);
            return new ResponseSuccess(ResponseMessage.EDIT_REQUEST_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async approveEditJobClientSide(jobDetailDto: JobDetailDto, currentUser: any) {
        try {
            const { job_id } = jobDetailDto;

            if (currentUser.user_type === 'vendor') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, edit_job_request: 'vendor' });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.NO_EDIT_REQUEST, null, HttpStatus.BAD_REQUEST);
            }

            const { total_pay_amount, frequency, job_deadline, } = findJobAction;
            //update job table field, discussion needed
            const jobPayload = {
                budget: total_pay_amount,
                frequency: frequency,
                deadline: job_deadline
            };
            await this.jobModel.updateOne({ _id: job_id }, jobPayload);
            await this.jobActionModel.updateOne({ _id: findJobAction._id }, { edit_job_request: 'default', edit_job_request_status: 'client_approved' });
            return new ResponseSuccess(ResponseMessage.APPROVED_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async declineEditJobClientSide(declineEditJobClientDto: DeclineEditJobClientDto, currentUser: any) {
        try {
            const { job_id, reason, comment } = declineEditJobClientDto;

            if (currentUser.user_type !== 'client') {
                return new ResponseError(ResponseMessage.NOT_AUTHORIZED, null, HttpStatus.BAD_REQUEST);
            }

            const findJobAction = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, edit_job_request: 'vendor' });
            if (!findJobAction) {
                return new ResponseError(ResponseMessage.NO_EDIT_REQUEST, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                edit_job_request: 'default',
                edit_job_request_status: 'client_declined',
                client_declined_reason: reason,
                client_declined_comment: comment
            }
            await this.jobActionModel.updateOne({ _id: findJobAction._id }, refData);
            return new ResponseSuccess(ResponseMessage.DECLINED_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateTaskNames(inputDescription: string) {
        try {
            const prompt = `Generate 3 short task names based on the following job description: ${inputDescription}. Do not use numbered lists. Keep the task names concise and to the point.`
            // API request to OpenAI's GPT model using the OpenAI package
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo", // or "gpt-4" if available
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                max_tokens: 100,
                temperature: 0.7,
            });

            // Extract the task names from the response
            const taskNames = response.choices[0].message.content.trim().split('\n');
            return taskNames;
        } catch (error) {
            console.error("Error generating task names:", error);
            return [];
        }
    }

    // async aiCreatedTask(job_id: any, client_user_id: any, input_description: string) {
    //     input_description = "Looking for a skilled Software Developer to design and build responsive websites. Must have expertise in web technologies, front-end and back-end development, and a passion for creating functional, user-friendly designs.";

    //     const findTask = await this.generateTaskNames(input_description);
    //     console.log('iiiiiii====', findTask)

    //     if (findTask.length) {
    //         for (const val of findTask) {
    //             const refData = {
    //                 client_user_id: new mongoose.Types.ObjectId('67626bfe87ef8580b2e082f3'),
    //                 job_id: new mongoose.Types.ObjectId('6763f6c1a322300f4eef1d29'),
    //                 task_name: val
    //             }
    //             await this.jobTaskModel.create(refData);
    //         }
    //     }
    // }

    async testApi() {
        try {
            const input_description = "Looking for a skilled Software Developer to design and build responsive websites. Must have expertise in web technologies, front-end and back-end development, and a passion for creating functional, user-friendly designs.";

            const findTask = await this.generateTaskNames(input_description);
            console.log('iiiiiii====', findTask)

            if (findTask.length) {
                for (const val of findTask) {
                    const refData = {
                        client_user_id: new mongoose.Types.ObjectId('67626bfe87ef8580b2e082f3'),
                        job_id: new mongoose.Types.ObjectId('6763f6c1a322300f4eef1d29'),
                        task_name: val,
                        task_description: 'This is test description'
                    }
                    await this.jobTaskModel.create(refData);
                }
            }

            return new ResponseSuccess('Sucessss', null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addNewTask(addNewTaskDto: AddNewTaskDto, currentUser: any) {
        try {
            const { job_id, title, description, requirement_check, image } = addNewTaskDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, status: { $ne: ConstantValues.JOB_STATUS_CLIENT_CLOSED } });
            if (!findData) {
                return new ResponseError(ResponseMessage.JOB_CLOSED_NO_ACTION, null, HttpStatus.BAD_REQUEST);
            }

            const findJobTask = await this.jobTaskModel.find({ job_id: new mongoose.Types.ObjectId(job_id) });
            if (findJobTask.length > 4) {
                return new ResponseError(ResponseMessage.JOB_TASK_LIMIT_EXCEEDED, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                client_user_id: currentUser._id,
                vendor_user_id: findData?.vendor_user_id,
                job_id: new mongoose.Types.ObjectId(job_id),
                task_name: title,
                task_description: description,
                requirement_check: requirement_check,
                image
            }

            await this.jobTaskModel.create(refData);
            return new ResponseSuccess(ResponseMessage.JOB_TASK_CREATE_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateNewTask(updateNewTaskDto: UpdateNewTaskDto, currentUser: any) {
        try {
            const { job_id, task_id, title, description, requirement_check, image } = updateNewTaskDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, status: { $ne: ConstantValues.JOB_STATUS_CLIENT_CLOSED } });
            if (!findData) {
                return new ResponseError(ResponseMessage.JOB_CLOSED_NO_ACTION, null, HttpStatus.BAD_REQUEST);
            }

            const findJobTask = await this.jobTaskModel.findOne({ _id: new mongoose.Types.ObjectId(task_id), job_id: new mongoose.Types.ObjectId(job_id) });
            if (!findJobTask) {
                return new ResponseError(ResponseMessage.TASK_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                task_name: title,
                task_description: description,
                requirement_check: requirement_check,
                image
            }

            await this.jobTaskModel.updateOne({ _id: findJobTask._id }, refData);
            return new ResponseSuccess(ResponseMessage.JOB_TASK_UPDATE_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async listTaskClient(jobDetailDto: JobDetailDto, currentUser: any) {
        try {
            const { job_id } = jobDetailDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }
            console.log('job=========', job_id)
            const taskData = await this.jobTaskModel.aggregate([
                {
                    $match: {
                        job_id: findJob?._id,  // Match tasks for the specific job ID
                        // status: 'pending'
                    },
                },
                {
                    $lookup: {
                        from: 'taskcomments',
                        localField: '_id',  // Match with the task ID from the jobTaskModel
                        foreignField: 'task_id',  // Match with the task_id in taskcomments
                        as: 'commentData',
                        pipeline: [
                            // { $match: { comment_by: 'client' } },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'client_user_id',  // Correct field for the client user
                                    foreignField: '_id',  // Match the client user by their ID
                                    as: 'clientUserData',
                                    pipeline: [
                                        // { $match: { comment_by: 'client' } },  // Ensure the client has commented
                                        {
                                            $project: {
                                                first_name: 1,
                                                last_name: 1,
                                                profile_img: 1,
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'vendor_user_id',  // Correct field for the vendor user
                                    foreignField: '_id',  // Match the vendor user by their ID
                                    as: 'vendorUserData',
                                    pipeline: [
                                        // { $match: { comment_by: 'vendor' } },  // Ensure the vendor has commented
                                        {
                                            $project: {
                                                first_name: 1,
                                                last_name: 1,
                                                profile_img: 1,
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, taskData, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async listApprovedTaskClient(jobDetailDto: JobDetailDto, currentUser: any) {
        try {
            const { job_id } = jobDetailDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }
            console.log('job=========', job_id)
            const taskData = await this.jobTaskModel.aggregate([
                {
                    $match: {
                        job_id: findJob?._id,  // Match tasks for the specific job ID
                        status: 'client_approved'
                    },
                },
                {
                    $lookup: {
                        from: 'taskcomments',
                        localField: '_id',  // Match with the task ID from the jobTaskModel
                        foreignField: 'task_id',  // Match with the task_id in taskcomments
                        as: 'commentData',
                        pipeline: [
                            // { $match: { comment_by: 'client' } },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'client_user_id',  // Correct field for the client user
                                    foreignField: '_id',  // Match the client user by their ID
                                    as: 'clientUserData',
                                    pipeline: [
                                        // { $match: { comment_by: 'client' } },  // Ensure the client has commented
                                        {
                                            $project: {
                                                first_name: 1,
                                                last_name: 1,
                                                profile_img: 1,
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'vendor_user_id',  // Correct field for the vendor user
                                    foreignField: '_id',  // Match the vendor user by their ID
                                    as: 'vendorUserData',
                                    pipeline: [
                                        // { $match: { comment_by: 'vendor' } },  // Ensure the vendor has commented
                                        {
                                            $project: {
                                                first_name: 1,
                                                last_name: 1,
                                                profile_img: 1,
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, taskData, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addCommentClient(addCommentClientDto: AddCommentClientDto, currentUser: any) {
        try {
            const { job_id, task_id, message, image } = addCommentClientDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findData = await this.jobActionModel.findOne({ job_id: new mongoose.Types.ObjectId(job_id), client_user_id: currentUser._id, status: { $ne: ConstantValues.JOB_STATUS_CLIENT_CLOSED } });
            if (!findData) {
                return new ResponseError(ResponseMessage.JOB_CLOSED_NO_ACTION, null, HttpStatus.BAD_REQUEST);
            }

            const findJobTask = await this.jobTaskModel.findOne({ _id: new mongoose.Types.ObjectId(task_id), job_id: new mongoose.Types.ObjectId(job_id) });
            if (!findJobTask) {
                return new ResponseError(ResponseMessage.TASK_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            const refData = {
                client_user_id: currentUser._id,
                vendor_user_id: findData?.vendor_user_id,
                job_id: findJob._id,
                task_id: findJobTask._id,
                comment_by: 'client',
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

    async approveTask(taskCommonDto: TaskCommonDto, currentUser: any) {
        try {
            const { job_id, task_id } = taskCommonDto;

            const findJob = await this.jobModel.findOne({ _id: job_id });
            if (!findJob) {
                return new ResponseError(ResponseMessage.JOB_NOT_ACTIVE, null, HttpStatus.BAD_REQUEST);
            }

            const findJobTask = await this.jobTaskModel.findOne({ _id: new mongoose.Types.ObjectId(task_id), job_id: new mongoose.Types.ObjectId(job_id) });
            if (!findJobTask) {
                return new ResponseError(ResponseMessage.TASK_NOT_EXIST, null, HttpStatus.BAD_REQUEST);
            }

            await this.jobTaskModel.updateOne({ _id: findJobTask?._id }, { status: 'client_approved' });
            return new ResponseSuccess(ResponseMessage.JOB_TASK_APPROVE_SUCCESS, null, HttpStatus.OK);
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelJobClient(cancelJobClientDto: CancelJobClientDto, currentUser: any) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();
            const { job_id } = cancelJobClientDto;

            const findJob = await this.jobModel.findOne({ _id: job_id }).session(session);
            if (!findJob) {
                console.error('Job not found.');
                throw new Error(ResponseMessage.JOB_NOT_EXIST);
            }

            if (findJob.status !== 'active') {
                console.error('Job is not active. Cannot cancel.');
                throw new Error(ResponseMessage.JOB_ACTIVE_NO_CANCEL);
            }

            console.log('Deleting job and related actions...');
            await this.jobModel.deleteOne({ _id: findJob._id }).session(session);
            await this.jobActionModel.deleteMany({ job_id: findJob._id }).session(session);

            await session.commitTransaction();
            console.log('Transaction committed successfully.');

            return new ResponseSuccess(ResponseMessage.JOB_CANCEL_SUCCESS, null, HttpStatus.OK);
        } catch (error) {
            console.error('Error during transaction:', error);
            await session.abortTransaction();
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            console.log('Session ended.');
            session.endSession();
        }
    }

    async jobListingForPopUp(currentUser: any) {
        try {
            const resData = await this.jobModel.aggregate([
                {
                    $match: {
                        client_user_id: currentUser._id
                    }
                },
                {
                    $lookup: {
                        from: 'jobactions',
                        localField: '_id',
                        foreignField: 'job_id',
                        as: 'jobActionData',    //client_rating_to_vendor
                        pipeline: [
                            {
                                $match: {
                                    status: ConstantValues.JOB_STATUS_VENDOR_ACCEPT
                                }
                            },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'vendor_user_id',
                                    foreignField: '_id',
                                    as: 'vendorUserData',
                                    pipeline: [
                                        {
                                            $lookup: {
                                                from: 'jobactions',
                                                localField: '_id',
                                                foreignField: 'vendor_user_id',
                                                as: 'vendorActionData',
                                                pipeline: [
                                                    {
                                                        $addFields: {
                                                            completed_job: {
                                                                $cond: [{ $eq: ["$status", "client_closed"] }, 1, 0]
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }, {
                                            $addFields: {
                                                total_avg_rating: { $ifNull: [{ $avg: '$vendorActionData.client_rating_to_vendor' }, 0] },
                                                total_completed_job: { $ifNull: [{ $sum: '$vendorActionData.completed_job' }, 0] }
                                            },
                                        }, {
                                            $project: {
                                                password: 0,
                                                vendorActionData: 0
                                            }
                                        },
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    $match: {
                        jobActionData: {
                            $not: { $size: 0 } // Ensures the array is not empty
                        }
                    }
                },
                {
                    $sort: {
                        updatedAt: -1
                    }
                },
                {
                    $limit: 3
                }
            ]);

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, resData, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async billingHistoryClient(currentUser: any) {
        try {
console.log('oooooooo')
            // const listInvoices = await this.Stripe.invoices.list({
            //     customer: 'cus_RSj45PYXyr1N0k',
            //     limit: 10,
            //     // status: 'paid'
            // });

            const charges = await this.Stripe.charges.list({
                customer: currentUser?.customer_id, 
                limit: 100,                  
            });

            return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, charges, HttpStatus.OK);

            // const paymentIntents = await this.Stripe.paymentIntents.list({
            //     customer: currentUser.customer_id,
            //     limit: 100, // Optional: Adjust as needed
            //     // starting_after: 'pi_xxxxxxxxxx',
            // });
 
            // // const paymentDetails = [];
            // // for (let val of paymentIntents?.data) {
            // //     const paymentIntent = await this.Stripe.paymentIntents.retrieve(val.id);
            // //     paymentDetails.push(paymentIntent);
            // // }

            const invoiceItem = await this.Stripe.invoiceItems.create({
                customer: 'cus_RSj45PYXyr1N0k',
                amount: 7500,  // amount in cents ($75.00)
                currency: 'usd',
                description: 'Payment for Service XYZ',
            });


            const invoice = await this.Stripe.invoices.create({
                customer: 'cus_RSj45PYXyr1N0k',
                auto_advance: true,  // Automatically finalize the invoice
                collection_method: 'charge_automatically',  // Automatically attempt to collect payment
            });
            
            // // const paymentDetails = await this.Stripe.invoices.retrieve(fullPaymentIntent.invoice)
            
            // return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, paymentIntents, HttpStatus.OK);
        } catch (error) {
            console.error('Error fetching client home data:', error);
            return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async jobSpendData(currentUser: any) {
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
                        client_user_id: currentUser._id,
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
}
