import { HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Job } from 'src/schemas/job.schema';
import mongoose, { Model } from 'mongoose';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { ResponseMessage } from 'src/common/constants/message';
import { CommonFunction } from '../common/helpers/common.function';
import { Category } from 'src/schemas/category.schema';
import { SubCategory } from 'src/schemas/sub-category.schema';
import { CreateCategoryDto, CreateSubCategoryDto } from './dto/create-category.dto';
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AiCategoryDto } from 'src/admins/dto/ai-category.dto';
import { template } from '../common/helpers/category.prompt';
import OpenAI from 'openai';
import * as AWS from 'aws-sdk';
import axios from 'axios';

@Injectable()
export class AdminService {
  private readonly openai: OpenAI;
  private readonly s3: AWS.S3;
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Add your API key here
    });

    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY, // Replace with your AWS Access Key ID
      secretAccessKey: process.env.AWS_S3_SECRET, // Replace with your AWS Secret Access Key
      region: process.env.AWS_S3_REGION, // Replace with your AWS region
    });
  }


  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      console.log('ooooooooooo')
      const { name } = createCategoryDto;

      return new ResponseError(ResponseMessage.INVALID_TOKEN, null, HttpStatus.UNAUTHORIZED);

      const newCategory = new this.categoryModel({ name: name });
      await newCategory.save();

      return new ResponseSuccess(ResponseMessage.CATEGORY_SUCCESS, newCategory, HttpStatus.OK);
    }
    catch (error) {
      console.error('Error creating user:', error);
      return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createSubCategory(createSubCategoryDto: CreateSubCategoryDto) {
    try {
      const { category_id, name } = createSubCategoryDto;

      return new ResponseError(ResponseMessage.INVALID_TOKEN, null, HttpStatus.UNAUTHORIZED);

      const newSubCategory = new this.subCategoryModel({ category_id: new mongoose.Types.ObjectId(category_id), name: name });
      await newSubCategory.save();

      return new ResponseSuccess(ResponseMessage.SUB_CATEGORY_SUCCESS, newSubCategory, HttpStatus.OK);
    }
    catch (error) {
      console.error('Error creating user:', error);
      return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async listCategories() {
    try {

      // const listCategory = await this.categoryModel.aggregate(
      //     [
      //         {
      //             $lookup: {
      //                 from: 'subcategories',
      //                 localField: '_id',
      //                 foreignField: 'category_id',
      //                 as: 'subCategoryData',
      //                 pipeline: [
      //                     {
      //                         $project: {
      //                             name: 1,
      //                             category_id: 1
      //                         }
      //                     }
      //                 ]
      //             }
      //         },
      //         {
      //             $project: {
      //                 name: 1,
      //                 'subCategoryData': 1
      //             }
      //         }
      //     ]
      // );

      const listCategory = await this.categoryModel.find();

      return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, listCategory, HttpStatus.OK);
    }
    catch (error) {
      console.error('Error creating user:', error);
      return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateResponse(input: string) {

    const model = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.7
    });

    const prompt = ChatPromptTemplate.fromTemplate(template);
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const result = await chain.invoke({ input });
    return result
  }

  async aiCategoryData(aiCategoryDto: AiCategoryDto) {
    try {
      const { input } = aiCategoryDto;

      const result = await this.generateResponse(input);

      return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, result ?? null, HttpStatus.OK);
    }
    catch (error) {
      console.error('Error creating user:', error);
      return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // async generateImage(description: string): Promise<string> {
  //     try {
  //         const response = await this.openai.images.generate({
  //             prompt: description,
  //             n: 1,
  //             size: '1024x1024',
  //         });

  //         const imageUrl = response.data[0]?.url;
  //         if (!imageUrl) {
  //             throw new Error('Image generation failed: No URL returned');
  //         }

  //         return imageUrl;
  //     } catch (error) {
  //         console.error('Error generating image:', error);
  //         throw new InternalServerErrorException(
  //             'An error occurred while generating the image. Please try again later.',
  //         );
  //     }
  // }

  async generateImage(description: string): Promise<string> {
    try {
      // Step 1: Generate Image
      const response = await this.openai.images.generate({
        prompt: description,
        n: 1,
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

  async aiGenerateImage(aiCategoryDto: AiCategoryDto) {
    try {
      const { input } = aiCategoryDto;

      const result = await this.generateImage(input);

      return new ResponseSuccess(ResponseMessage.DATA_SUCCESS, result ?? null, HttpStatus.OK);
    }
    catch (error) {
      console.error('Error creating user:', error);
      return new ResponseError(ResponseMessage.INTERNAL_SERVER_ERROR, null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
}
