import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseBaseSchema } from '../mongoose-base';

@Schema({
  timestamps: true,
  collection: 'admin',
})
export class AdminSchema extends MongooseBaseSchema {
  @Prop({})
  name!: string;
}

export const AdminSchemaFactory = SchemaFactory.createForClass(AdminSchema);
AdminSchemaFactory.index({ name: 'text' }, { weights: { name: 1 } });