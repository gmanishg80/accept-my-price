import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    vendor_user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    client_user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
    job_id: Types.ObjectId;

    @Prop({ required: true })
    text: string; 

    @Prop({ default: true })
    read_status: boolean; 
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
