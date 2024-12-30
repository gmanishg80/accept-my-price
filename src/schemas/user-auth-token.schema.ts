import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class UserAuthToken {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;

    @Prop({ required: true })
    token: string;
}

export const UserAuthTokenSchema = SchemaFactory.createForClass(UserAuthToken);
