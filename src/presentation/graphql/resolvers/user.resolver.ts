import {
  FetchUserUseCase,
  GetOneUserByConditionUseCase,
  CreateUserUseCase,
  UpdateOneUserByConditionUseCase,
  DeleteOneUserByConditionUseCase,
} from '@application';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphqlAuthApi, GraphqlAccountType } from '@shared/decorators';
import { _idArg, DataArg } from '../arguments';

import {
  CreateUserInputType,
  UpdateUserInputType,
  QueryGetListInputType,
} from '../input-types';
import { UserObjectType, UserPaginateObjectType } from '../object-types';

@Resolver(UserObjectType)
export class UserResolver {
  constructor(
    private readonly fetchUserUseCase: FetchUserUseCase,
    private readonly getOneUserByConditionUseCase: GetOneUserByConditionUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateOneUserByConditionUseCase: UpdateOneUserByConditionUseCase,
    private readonly deleteOneUserByConditionUseCase: DeleteOneUserByConditionUseCase,
  ) {}

  @Query(() => UserPaginateObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async getAllUsers(
    @Args(QueryGetListInputType.name, { nullable: true })
    queryGetListInput: QueryGetListInputType,
  ) {
    return await this.fetchUserUseCase.execute(queryGetListInput);
  }

  @Query(() => UserObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async getOneUserById(@_idArg() _id: string) {
    return this.getOneUserByConditionUseCase.execute({ _id });
  }

  @Mutation(() => UserObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async createUser(@DataArg() data: CreateUserInputType) {
    return this.createUserUseCase.execute(data);
  }

  @Mutation(() => UserObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async updateOneUserById(
    @_idArg() _id: string,
    @DataArg() data: UpdateUserInputType,
  ) {
    return this.updateOneUserByConditionUseCase.execute({ _id }, data);
  }

  @Mutation(() => UserObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async deleteOneUserById(@_idArg() _id: string) {
    return this.deleteOneUserByConditionUseCase.execute({ _id });
  }
}
