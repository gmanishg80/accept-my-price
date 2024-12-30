import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Support {

    @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
    job_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    vendor_user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    client_user_id: Types.ObjectId;

    @Prop({required: true})
    ticket_id: string;

    // @Prop()
    // catgeory: string;

    @Prop({required: true})
    reason: string;

    @Prop({required: true})
    message: string;

    @Prop()
    refund_sum: number;

    @Prop({ enum: ['report_job', 'customer_issue', 'refund_request', 'vendor_issue']})
    type: string;

    @Prop({ enum: ['default', 'low', 'medium', 'high'], default: 'default' })
    priority: string;

    @Prop({ enum: ['default', 'pending', 'open', 'cancelled'], default: 'default' })
    status: string;
}

export const SupportSchema = SchemaFactory.createForClass(Support);
