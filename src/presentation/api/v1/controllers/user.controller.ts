import {
  CreateUserUseCase,
  DeleteOneUserByConditionUseCase,
  FetchUserUseCase,
  GetOneUserByConditionUseCase,
  UpdateOneUserByConditionUseCase,
} from '@application';
import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { QueryGetListInputSchema } from '../input-schemas/base';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiResponseObjectSchema,
  ApiResponsePaginationObjectSchema,
} from '@shared/decorators/swagger';
import { UserObjectSchema } from '../object-schemas';
import { CreateUserInputSchema, UpdateUserInputSchema } from '../input-schemas';

@ApiTags('User')
@Controller('api/v1/user')
export class UserV1Controller {
  constructor(
    private readonly fetchUserUseCase: FetchUserUseCase,
    private readonly getOneUserByConditionUseCase: GetOneUserByConditionUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateOneUserByConditionUseCase: UpdateOneUserByConditionUseCase,
    private readonly deleteOneUserByConditionUseCase: DeleteOneUserByConditionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get All User' })
  @ApiResponsePaginationObjectSchema(UserObjectSchema)
  async getAllUser(@Query() queryGetListInput: QueryGetListInputSchema) {
    return await this.fetchUserUseCase.execute(queryGetListInput);
  }

  @Get(':_id')
  @ApiOperation({ summary: 'Get One User' })
  @ApiResponseObjectSchema(UserObjectSchema)
  async getOneUserById(@Param('_id') _id: string) {
    return this.getOneUserByConditionUseCase.execute({ _id });
  }

  @Post()
  @ApiOperation({ summary: 'Create One User' })
  @ApiResponseObjectSchema(UserObjectSchema)
  async createUser(@Body() data: CreateUserInputSchema) {
    return this.createUserUseCase.execute(data);
  }

  @Patch(':_id')
  @ApiOperation({ summary: 'Update One User' })
  @ApiBody({ type: UpdateUserInputSchema })
  @ApiResponseObjectSchema(UserObjectSchema)
  async updateOneUserById(
    @Param('_id') _id: string,
    @Body() data: UpdateUserInputSchema,
  ) {
    return this.updateOneUserByConditionUseCase.execute({ _id }, data);
  }

  @Delete(':_id')
  @ApiOperation({ summary: 'Delete One User' })
  @ApiResponseObjectSchema(UserObjectSchema)
  async deleteOneUserById(@Param('_id') _id: string) {
    return this.deleteOneUserByConditionUseCase.execute({ _id });
  }
}
