import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';

class ServiceName {
    @Prop({ type: String, required: true })
    category_id: string;

    @Prop({ type: String, required: true })
    category_name: string;

    @Prop({ default: false })
    is_default: boolean;
}

class UserName {
    @Prop({ type: String, required: true })
    user_id: string;

    @Prop({ type: String, required: true })
    first_name: string;

    @Prop({ type: String, required: true })
    last_name: string;

}
@Schema({ timestamps: true })
export class Service {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    vendor_user_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Subscription', required: true })
    subscription_id: Types.ObjectId;

    @Prop()
    service_type: string;

    @Prop({ type: [ServiceName], required: true })
    services: ServiceName[];

    @Prop({ type: [UserName], required: true })
    users: UserName[];

    @Prop()
    price_id: string;

    @Prop()
    item_id: string;

    @Prop()
    amount: number;

    // @Prop({ default: 1 })
    // quantity: number;

    @Prop({ enum: ['active', 'cancelled'], default: 'active' })
    status: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
