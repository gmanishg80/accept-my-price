import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentLog {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    vendor_user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    client_user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
    job_id: Types.ObjectId;

    @Prop({ required: true })
    payment_intent_id: string; 

    @Prop({ required: false })
    payment_method_id: string; 

    @Prop({ required: true })
    amount: number; 

    @Prop({ required: true })
    currency: string; 

    @Prop({ required: true })
    status: boolean; // Payment status (e.g., 'succeeded', 'failed', 'pending')

    @Prop({ required: false })
    customer_id: string; 

    @Prop({ required: false })
    destination_account: string; // Stripe Connect Account ID of the vendor

    @Prop({ required: false })
    description: string; // Description of the payment

    @Prop({ default: false })
    is_initial_payment: boolean; 

    @Prop({ required: false })
    failure_reason: string; // Reason for payment failure, if applicable

}

export const PaymentLogSchema = SchemaFactory.createForClass(PaymentLog);
