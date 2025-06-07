import {
  FetchPostUseCase,
  GetOnePostByConditionUseCase,
  CreatePostUseCase,
  UpdateOnePostByConditionUseCase,
  DeleteOnePostByConditionUseCase,
} from '@application';
import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  ApiResponsePaginationObjectSchema,
  ApiResponseObjectSchema,
  ApiAuthRequired,
} from '@shared/decorators/swagger';
import {
  QueryGetListInputSchema,
  CreatePostInputSchema,
  UpdatePostInputSchema,
} from '../input-schemas';
import { PostObjectSchema } from '../object-schemas';

@ApiTags('Post V1')
@Controller('api/v1/post')
export class PostV1Controller {
  constructor(
    private readonly fetchPostUseCase: FetchPostUseCase,
    private readonly getOnePostByConditionUseCase: GetOnePostByConditionUseCase,
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updateOnePostByConditionUseCase: UpdateOnePostByConditionUseCase,
    private readonly deleteOnePostByConditionUseCase: DeleteOnePostByConditionUseCase,
  ) {}

  @Get()
  @ApiAuthRequired()
  @ApiOperation({ summary: 'Get All Post' })
  @ApiResponsePaginationObjectSchema(PostObjectSchema)
  async getAllPost(@Query() queryGetListInput: QueryGetListInputSchema) {
    console.log('queryGetListInput', queryGetListInput);
    return await this.fetchPostUseCase.execute(queryGetListInput);
  }

  @Get(':_id')
  @ApiOperation({ summary: 'Get One Post' })
  @ApiResponseObjectSchema(PostObjectSchema)
  async getOnePostById(@Param('_id') _id: string) {
    return this.getOnePostByConditionUseCase.execute({ _id });
  }

  @Post()
  @ApiOperation({ summary: 'Create One Post' })
  @ApiResponseObjectSchema(PostObjectSchema)
  async createPost(@Body() data: CreatePostInputSchema) {
    return this.createPostUseCase.execute(data);
  }

  @Patch(':_id')
  @ApiOperation({ summary: 'Update One Post' })
  @ApiBody({ type: UpdatePostInputSchema })
  @ApiResponseObjectSchema(PostObjectSchema)
  async updateOnePostById(
    @Param('_id') _id: string,
    @Body() data: UpdatePostInputSchema,
  ) {
    return this.updateOnePostByConditionUseCase.execute({ _id }, data);
  }

  @Delete(':_id')
  @ApiOperation({ summary: 'Delete One Post' })
  @ApiResponseObjectSchema(PostObjectSchema)
  async deleteOnePostById(@Param('_id') _id: string) {
    return this.deleteOnePostByConditionUseCase.execute({ _id });
  }
}