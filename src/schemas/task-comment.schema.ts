import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class TaskComment {
    @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
    job_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'JobTask', required: true })
    task_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    vendor_user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    client_user_id: Types.ObjectId;

    @Prop()
    comment_by: string;

    @Prop()
    message: string;

    @Prop()
    image: string;
}

export const TaskCommentSchema = SchemaFactory.createForClass(TaskComment);
