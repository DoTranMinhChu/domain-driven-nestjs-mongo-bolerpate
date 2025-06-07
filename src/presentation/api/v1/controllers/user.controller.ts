import {
  FetchUserUseCase,
  GetOneUserByConditionUseCase,
  CreateUserUseCase,
  UpdateOneUserByConditionUseCase,
  DeleteOneUserByConditionUseCase,
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
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger/dist';
import {
  ApiResponsePaginationObjectSchema,
  ApiResponseObjectSchema,
  ApiAuthRequired,
} from '@shared/decorators/swagger';
import {
  QueryGetListInputSchema,
  CreateUserInputSchema,
  UpdateUserInputSchema,
} from '../input-schemas';
import { UserObjectSchema } from '../object-schemas';
import { AuthApi } from '@shared/decorators';

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
  @ApiAuthRequired()
  @ApiOperation({ summary: 'Get All User' })
  @ApiResponsePaginationObjectSchema(UserObjectSchema)
  async getAllUser(@Query() queryGetListInput: QueryGetListInputSchema) {
    console.log('queryGetListInput', queryGetListInput);
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
