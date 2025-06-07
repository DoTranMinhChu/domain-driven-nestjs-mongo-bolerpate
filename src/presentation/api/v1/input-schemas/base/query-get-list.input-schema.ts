import { ApiProperty } from '@nestjs/swagger/dist';
import { Type } from 'class-transformer';
import { IsOptional, IsObject, IsString } from 'class-validator';

export class QueryGetListInputSchema {
  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  offset?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({
    required: false,
    type: 'string',
    example: { createdAt: 'DESC' },
  })
  @IsOptional()
  order?: Record<string, any>;

  @ApiProperty({
    required: false,
    type: 'string',
    example: JSON.stringify({ isActivated: true }),
  })
  @IsOptional()
  filter?: Record<string, any>;

  @ApiProperty({ required: false, example: 'keyword' })
  @IsOptional()
  @IsString()
  search?: string;
}
