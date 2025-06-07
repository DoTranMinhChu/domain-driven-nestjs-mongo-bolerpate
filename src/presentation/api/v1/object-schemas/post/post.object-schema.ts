import { MongooseBaseObjectSchema } from '@infrastructure/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class PostObjectSchema extends MongooseBaseObjectSchema {
  @ApiProperty({
    description: 'Name of Post',
    example: 'Name',
  })
  name!: string;
}