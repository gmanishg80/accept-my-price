import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

class Service {
    @Prop({ type: String, required: true })
    category_id: string;
  
    @Prop({ type: String, required: true })
    category_name: string;
  }

@Schema({ timestamps: true })
export class VendorProfile {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    vendor_user_id: Types.ObjectId;

    @Prop()
    bussiness_name: string;

    @Prop()
    fein: string;

    // @Prop()
    // subscription_id: string;

    // @Prop()
    // subscription_plan_id: string;

    @Prop()
    stripe_connect_api: string;

    // @Prop({ default: false })
    // subscription_status: boolean;

    @Prop()
    destination_account: string 

    @Prop({ default: false })
    stripe_connect_account_status: boolean

    @Prop({ type: [Service], required: true })
    services: Service[];

    // @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    // category_id: Types.ObjectId;
}

export const VendorProfileSchema = SchemaFactory.createForClass(VendorProfile);
