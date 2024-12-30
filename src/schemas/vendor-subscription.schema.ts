import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class VendorSubscription {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    vendor_user_id: Types.ObjectId;

    @Prop({ type: String })
    subscription_id: string;

    @Prop({ type: String })
    customer_id: string;

    @Prop({ type: String })
    price_id: string;

    @Prop({ type: Date })
    start_date: Date;

    @Prop({ type: Date })
    end_date?: Date;

    @Prop({ type: Boolean, default: false })
    is_trial?: Boolean;

    @Prop({ type: Date })
    trial_end_date?: Date;

    @Prop({ type: String })
    status: string;
}

export const VendorSubscriptionSchema = SchemaFactory.createForClass(VendorSubscription);
