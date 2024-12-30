import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class Job {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    client_user_id: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop()
    profile_img: string;
    
    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    category_id: Types.ObjectId;

    @Prop({ required: true })
    budget: number;

    @Prop({ enum: ['one-time', 'hourly', 'daily', 'weekly', 'monthly'], required: true })
    frequency: string;

    @Prop({ enum: ['current', 'other', 'remote'], required: true })
    address_type: string;

    @Prop({ type: Object })
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        longitude: number;
        latitude: number;
    }

    @Prop()
    longitude: number;
    
    @Prop()
    latitude: number;

    @Prop({
        type: {
            type: String,
            enum: ['Point'], 
        },
        coordinates: {
            type: [Number],
        },
    })

    location: {
        type: string;
        coordinates: [number, number];
    };

    @Prop({ enum: ['active', 'pending', 'closed'] })
    status: string;

    @Prop()
    total_pay_amt: number;

    @Prop()
    initial_pay_amt: number;

    @Prop()
    deadline: number;

    // @Prop()
    // accept_date: number;

    // @Prop()
    // deadline: number;

    @Prop()
    payment_method_id: string;

}

export const JobSchema = SchemaFactory.createForClass(Job);
