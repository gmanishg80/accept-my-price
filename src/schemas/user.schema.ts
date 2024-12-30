import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';


// @Schema()
// export class Address {
//     @Prop()
//     street: string;

//     @Prop()
//     city: string;

//     @Prop()
//     state: string;

//     @Prop()
//     postalCode: string;

//     @Prop()
//     country: string;
// }

// export const AddressSchema = SchemaFactory.createForClass(Address);


@Schema({ timestamps: true })
export class User {
    @Prop()
    first_name: string;

    @Prop()
    last_name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    dial_code: string;

    @Prop()
    phone_number: string;

    @Prop()
    password: string;

    @Prop()
    profile_img: string;

    @Prop({ default: true })
    email_notification: boolean;

    @Prop({ default: true })
    phone_notification: boolean;

    @Prop({ enum: ['email', 'google', 'apple'] })
    login_type: string;

    @Prop()
    google_id: string;

    @Prop({ enum: ['client', 'vendor', 'vendor_child'] })
    user_type: string;

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

    @Prop()
    customer_id: string;

    @Prop()
    parent_user_id: string;

    @Prop({ type: [String] })
    child_permission: string[];

    @Prop({ enum: [0, 1, 2, 3, 4], default: 0 })
    profile_status: number;

    @Prop()
    email_otp: string;

    @Prop({ default: false })
    is_email_verified: boolean;

    @Prop()
    subscription_id: string;

    @Prop()
    subscription_plan_id: string;

    @Prop({ default: false })
    subscription_status: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
