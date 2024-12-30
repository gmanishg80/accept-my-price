import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class SubCategory {
    
    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    category_id: Types.ObjectId;

    @Prop()
    name: string;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
