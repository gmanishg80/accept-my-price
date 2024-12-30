import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class VendorTransaction {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    vendor_user_id: Types.ObjectId;

    @Prop({ type: String })
    subscription_id: string;

    @Prop({ type: String })
    customer_id: string;

    @Prop({ type: String })
    price_id: string;

    @Prop({ type: String })
    status: string;
}

export const VendorTransactionSchema = SchemaFactory.createForClass(VendorTransaction);
