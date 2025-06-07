import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class MongooseBaseObjectSchema {
  @ApiProperty({
    description: 'ID (Mongo ObjectID)',
    example: '507f191e810c19729de860ea',
  })
  @Type(() => Types.ObjectId)
  _id!: Types.ObjectId;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2025-05-30T12:34:56.789Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật mới nhất',
    example: '2025-05-31T08:22:33.123Z',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Thời gian xoá (nếu đã soft-delete)',
    example: null,
    nullable: true,
  })
  deletedAt?: Date;
}

export { MongooseBaseObjectSchema };
