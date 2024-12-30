import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { Model } from 'mongoose';
import axios from 'axios';
import * as AWS from 'aws-sdk';
import { Job } from 'src/schemas/job.schema';

@Processor('ai-image-queue')
export class AiImageProcessor extends WorkerHost {
    private openai: OpenAI;
    private readonly s3: AWS.S3;
    private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    constructor(
        @InjectModel(Job.name) private readonly jobModel: Model<Job>
    ) {
        super();
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        AWS.config.update({
            accessKeyId: process.env.AWS_S3_ACCESS_KEY,
            secretAccessKey: process.env.AWS_S3_SECRET,
            region: process.env.AWS_S3_REGION,
        });
        this.s3 = new AWS.S3(); // Initialize S3
    }

    async process(job: any): Promise<void> {
        console.log('Processing job:', job.data);

        try {
            const { job_id, client_user_id, description } = job.data;

            const generateImage = await this.aiGenerateImage(description);
            if (generateImage) {
                await this.jobModel.findByIdAndUpdate({ _id: job_id }, { profile_img: generateImage });
                console.log('Updated Job with AI-Generated Image URL:', generateImage);
            } else {
                console.error('Image generation and upload failed');
            }
        } catch (error) {
            console.error('Error processing job:', error);
        }
    }

    private async aiGenerateImage(input: string) {
        try {
            const result = await this.generateImage(input);
            return result
        }
        catch (error) {
            console.error('Error creating user:', error);
            return false
        }
    }

    private async generateImage(jobName: string): Promise<string> {
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
                Bucket: this.bucketName, // Replace with your S3 bucket name
                Key: key,
                Body: imageData,
                ContentType: 'image/png', // Adjust if the image type is different
            };
            console.log('ooooooparams', params)
            const uploadResult = await this.s3.upload(params).promise();
            return uploadResult.Key; // Return the uploaded file's URL
        } catch (error) {
            console.error('Error uploading image to S3:', error);
            throw new InternalServerErrorException('Failed to upload image to S3');
        }
    }
}