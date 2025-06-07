import { Type } from '@nestjs/common';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class PagingObjectSchema {
  @ApiProperty({
    description: 'Số lượng bản ghi trả về mỗi trang',
    example: 10,
  })
  limit!: number;

  @ApiProperty({ description: 'Số bản ghi bỏ qua (offset)', example: 0 })
  offset!: number;

  @ApiProperty({ description: 'Số trang hiện tại (bắt đầu từ 1)', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Tổng số bản ghi', example: 125 })
  total!: number;
}
export const PaginatedResponseDto = <TModel extends Type<any>>(
  model: TModel,
) => {
  @ApiExtraModels(model)
  class PaginatedDtoClass {
    @ApiProperty({
      type: [model],
      isArray: true,
      description: 'Danh sách bản ghi theo trang hiện tại',
    })
    data!: InstanceType<TModel>[];

    @ApiProperty({ description: 'Tổng số bản ghi', example: 125 })
    total!: number;

    @ApiProperty({
      type: () => PagingObjectSchema,
      description: 'Metadata phân trang',
    })
    pagination!: PagingObjectSchema;
  }
  return PaginatedDtoClass;
};
