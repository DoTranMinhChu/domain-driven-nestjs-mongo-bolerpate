import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseBaseSchema } from '../mongoose-base.schema';

@Schema({
  timestamps: true,
  collection: 'user',
})
export class UserSchema extends MongooseBaseSchema {
  @Prop({ text: true })
  name!: string;

  @Prop({})
  email?: string;

  @Prop()
  password!: string;

  @Prop()
  username!: string;

  // @Field((_type: any) => [RefreshTokenUserData])
  // refreshTokens!: RefreshTokenUserData[];
}

export const UserSchemaFactory = SchemaFactory.createForClass(UserSchema);
// UserSchemaFactory.index({ name: 'text' }, { weights: { name: 1 } });
