
import { MongooseBaseObjectSchema } from '@infrastructure/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class UserObjectSchema extends MongooseBaseObjectSchema {
  @ApiProperty({
    description: 'Tên bài viết',
    example: 'Hướng dẫn sử dụng NestJS',
  })
  name!: string;
}
