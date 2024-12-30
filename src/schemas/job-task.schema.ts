import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class JobTask {
    @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
    job_id: Types.ObjectId;

    // @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    // vendor_user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    client_user_id: Types.ObjectId;

    @Prop()
    task_name: string;

    @Prop()
    task_description: string;

    @Prop({ default: false })
    requirement_check: boolean;

    @Prop()
    image: string;

    @Prop({ enum: ['pending', 'client_approved'], default: 'pending' })
    status: string;
}

export const JobTaskSchema = SchemaFactory.createForClass(JobTask);
