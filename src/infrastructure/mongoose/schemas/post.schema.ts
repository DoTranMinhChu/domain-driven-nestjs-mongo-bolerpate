import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseBaseSchema } from '../mongoose-base';

@Schema({
  timestamps: true,
  collection: 'post',
})
export class PostSchema extends MongooseBaseSchema {
  @Prop({})
  name!: string;
}

export const PostSchemaFactory = SchemaFactory.createForClass(PostSchema);
PostSchemaFactory.index({ name: 'text' }, { weights: { name: 1 } });
