import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { OpenAI } from 'openai';
import mongoose, { Model } from 'mongoose';
import { Job } from 'src/schemas/job.schema';
import { JobTask } from 'src/schemas/job-task.schema';

console.log('from file======>>>>')
@Processor('ai-job-task-queue')
export class AiJobTaskProcessor extends WorkerHost {
    private openai: OpenAI;

    constructor(
        @InjectModel(JobTask.name) private jobTaskModel: Model<JobTask>,
    ) {
        super();
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async process(job: any): Promise<void> {
        console.log('Processing job:', job.data);
        try {
            const { job_id, client_user_id, description } = job.data;

            const taskGenerated = await this.aiCreatedTask(job_id, client_user_id, description);
            if (taskGenerated) {
                console.log('Tasks successfully generated and saved.');
            } else {
                console.error('Task generation and saving failed.');
            }
        } catch (error) {
            console.error('Error processing job:', error);
        }
    }

    private async aiCreatedTask(job_id: string, client_user_id: string, input_description: string): Promise<boolean> {
        try {
            const taskNames = await this.generateTaskNames(input_description);
            console.log('Generated Task Names:', taskNames);

            if (taskNames.length) {
                for (const taskName of taskNames) {
                    const taskData = {
                        client_user_id: new mongoose.Types.ObjectId(client_user_id),
                        job_id: new mongoose.Types.ObjectId(job_id),
                        task_name: taskName,
                        task_description: 'This is test description'
                    };
                    await this.jobTaskModel.create(taskData);  // Insert tasks one by one
                }
                return true;
            } else {
                console.warn('No task names generated.');
                return false;
            }
        } catch (error) {
            console.error('Error generating tasks:', error);
            return false;
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
}

