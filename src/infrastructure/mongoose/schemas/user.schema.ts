import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseBaseSchema } from '../mongoose-base';

@Schema({
  timestamps: true,
  collection: 'user',
})
export class UserSchema extends MongooseBaseSchema {
  @Prop({})
  name!: string;

  @Prop({})
  email?: string;

  @Prop()
  password!: string;

  @Prop()
  username!: string;
}

export const UserSchemaFactory = SchemaFactory.createForClass(UserSchema);
UserSchemaFactory.index({ name: 'text' }, { weights: { name: 1 } });
