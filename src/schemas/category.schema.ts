import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class Category {
   
    @Prop()
    name: string;

    @Prop()
    order: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
