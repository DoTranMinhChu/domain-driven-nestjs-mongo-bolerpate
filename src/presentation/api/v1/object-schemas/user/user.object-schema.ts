import { MongooseBaseObjectSchema } from '@infrastructure/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class UserObjectSchema extends MongooseBaseObjectSchema {
  @ApiProperty({
    description: 'Name of user',
    example: 'Name',
  })
  name!: string;
}
