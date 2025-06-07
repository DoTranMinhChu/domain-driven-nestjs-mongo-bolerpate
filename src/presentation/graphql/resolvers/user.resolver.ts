import {
  FetchUserUseCase,
  GetOneUserByConditionUseCase,
  CreateUserUseCase,
  UpdateOneUserByConditionUseCase,
  DeleteOneUserByConditionUseCase,
  UserLoginUseCase,
  UserRegistrationUseCase,
} from '@application';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphqlAuthApi, GraphqlAccountType } from '@shared/decorators';
import { _idArg, DataArg } from '../arguments';

import {
  CreateUserInputType,
  UpdateUserInputType,
  QueryGetListInputType,
  UserLoginInputType,
  UserRegistrationInputType,
} from '../input-types';
import {
  UserLoginObjectType,
  UserObjectType,
  UserPaginateObjectType,
} from '../object-types';
import { EAccountType } from '@shared/enums';

@Resolver(UserObjectType)
export class UserResolver {
  constructor(
    private readonly fetchUserUseCase: FetchUserUseCase,
    private readonly getOneUserByConditionUseCase: GetOneUserByConditionUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateOneUserByConditionUseCase: UpdateOneUserByConditionUseCase,
    private readonly deleteOneUserByConditionUseCase: DeleteOneUserByConditionUseCase,
    private readonly userLoginUseCase: UserLoginUseCase,
    private readonly userRegistrationUseCase: UserRegistrationUseCase,
  ) {}

  @Query(() => UserPaginateObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([EAccountType.ADMIN])
  async getAllUser(
    @Args(QueryGetListInputType.name, { nullable: true })
    queryGetListInput: QueryGetListInputType,
  ) {
    return await this.fetchUserUseCase.execute(queryGetListInput);
  }

  @Query(() => UserObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([EAccountType.ADMIN])
  async getOneUserById(@_idArg() _id: string) {
    return this.getOneUserByConditionUseCase.execute({ _id });
  }

  @Mutation(() => UserObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([EAccountType.ADMIN])
  async createUser(@DataArg() data: CreateUserInputType) {
    return this.createUserUseCase.execute(data);
  }

  @Mutation(() => UserObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([EAccountType.ADMIN])
  async updateOneUserById(
    @_idArg() _id: string,
    @DataArg() data: UpdateUserInputType,
  ) {
    return this.updateOneUserByConditionUseCase.execute({ _id }, data);
  }

  @Mutation(() => UserObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([EAccountType.ADMIN])
  async deleteOneUserById(@_idArg() _id: string) {
    return this.deleteOneUserByConditionUseCase.execute({ _id });
  }

  @Mutation(() => UserLoginObjectType)
  async userLogin(@DataArg() data: UserLoginInputType) {
    return this.userLoginUseCase.execute(data);
  }

  @Mutation(() => UserLoginObjectType)
  async userRegistration(@DataArg() data: UserRegistrationInputType) {
    return this.userRegistrationUseCase.execute(data);
  }
}
