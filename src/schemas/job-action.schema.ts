import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

class InsuranceData {
    @Prop()
    insurance_amount: number;

    @Prop()
    service_fee: number;

    @Prop()
    total_payout_amount: number;
}

@Schema({ timestamps: true })
export class JobAction {
    @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
    job_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    vendor_user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    client_user_id: Types.ObjectId;

    @Prop({ enum: ['vendor_reject', 'pending', 'client_confirm', 'vendor_accept', 'client_closed', 'vendor_closed', 'vendor_cancel'], default: 'pending' })
    status: string;

    @Prop({ enum: ['one-time', 'hourly', 'daily', 'weekly', 'monthly'] })
    frequency: string;

    @Prop({ default: false })
    initial_pay_status: boolean;

    @Prop()
    initial_pay_amount: number;

    @Prop()
    total_pay_amount: number;

    @Prop()
    initial_pay_date: number;

    @Prop()
    vendor_job_accept_date: number;

    @Prop()
    client_job_accept_date: number;

    @Prop()
    client_job_approve_date: number;

    @Prop()
    job_start_date: number;

    @Prop()
    job_deadline: number;

    @Prop()
    client_rating_to_vendor: number;

    @Prop()
    client_comment_to_vendor: string;

    @Prop()
    client_comment_to_vendor_date: number;

    @Prop()
    vendor_rating_to_client: number;

    @Prop()
    vendor_comment_to_client: string;

    @Prop()
    vendor_comment_to_client_date: number;

    @Prop()
    vendor_job_close_date: number;

    @Prop()
    client_job_close_date: number;

    @Prop()
    vendor_job_cancel_date: number;

    @Prop()
    vendor_cancel_reason: string;

    @Prop()
    vendor_cancel_comment: string;

    @Prop({ enum: ['default', 'vendor', 'client'], default: 'default' })
    edit_job_request: string;

    @Prop({ enum: ['default', 'vendor_approved', 'client_approved', 'vendor_declined', 'client_declined'], default: 'default' })
    edit_job_request_status: string;

    @Prop()
    client_declined_reason: string;

    @Prop()
    client_declined_comment: string;

    @Prop()
    vendor_declined_reason: string;

    @Prop()
    vendor_declined_comment: string;

    @Prop({ default: false })
    is_insured: boolean;

    @Prop({ type: InsuranceData }) 
    insurance: InsuranceData;

}

export const JobActionSchema = SchemaFactory.createForClass(JobAction);
