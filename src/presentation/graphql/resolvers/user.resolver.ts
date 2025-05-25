import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import {
  GraphqlAccountType,
  GraphqlAuthApi,
  Requester,
  RequesterDTO,
} from '@shared/decorators';
import { EAccountType } from '@shared/enums';
import {
  UserObjectType,
  UserPaginateObjectType,
} from '../object-types/users/user.object-type';
import {
  CreateUserInputType,
  UpdateUserInputType,
  UserLoginInputType,
  UserRegistrationInputType,
} from '../input-types/users';
import { QueryGetListInputType } from '../input-types/base';
import { UserLoginService } from '@domain/user/services/user-login.service';
import { UserLoginObjectType } from '../object-types';
import { UserLoginUseCase } from '@application/user/use-cases/user-login.use-case';
import {
  CreateUserUseCase,
  DeleteOneUserByConditionUseCase,
  FetchUsersUseCase,
  GetOneUserByConditionUseCase,
  UpdateOneUserByConditionUseCase,
  UserRegistrationUseCase,
} from '@application/user';
import { _idArg, DataArg } from '../arguments';

@Resolver(UserObjectType)
export class UserResolver {
  constructor(
    private readonly fetchUsersUseCase: FetchUsersUseCase,
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
  async getAllUsers(
    @Args(QueryGetListInputType.name, { nullable: true })
    queryGetListInput: QueryGetListInputType,
  ) {
    return await this.fetchUsersUseCase.execute(queryGetListInput);
  }

  @Query(() => UserObjectType)
  @GraphqlAuthApi()
  async getOneUserById(@_idArg() _id: string) {
    return this.getOneUserByConditionUseCase.execute({ _id });
  }
  @Mutation(() => UserObjectType)
  @GraphqlAuthApi()
  async createUser(@DataArg() data: CreateUserInputType) {
    return this.createUserUseCase.execute(data);
  }
  @Mutation(() => UserObjectType)
  @GraphqlAuthApi()
  async updateOneUserById(
    @_idArg() _id: string,
    @DataArg() data: UpdateUserInputType,
  ) {
    return this.updateOneUserByConditionUseCase.execute({ _id }, data);
  }

  @Mutation(() => UserObjectType)
  @GraphqlAuthApi()
  async deleteOneUserById(@_idArg() _id: string) {
    return this.deleteOneUserByConditionUseCase.execute({ _id });
  }
  @Mutation(() => UserLoginObjectType)
  async userRegistration(
    @Args(UserRegistrationInputType.name)
    userRegistrationInput: UserRegistrationInputType,
  ): Promise<UserLoginObjectType> {
    return this.userRegistrationUseCase.execute(userRegistrationInput);
  }

  @Mutation(() => UserLoginObjectType)
  async userLogin(
    @Args(UserLoginInputType.name) userLoginInput: UserLoginInputType,
  ): Promise<UserLoginObjectType> {
    return this.userLoginUseCase.execute(userLoginInput);
  }
  @Query(() => UserObjectType)
  @GraphqlAuthApi()
  async getMyInformation(@Requester() requester: RequesterDTO) {
    return requester.getUser();
  }

  // @ResolveField()
  // @GraphqlAuthApi()
  // totalBalance(
  //   @Parent() user: UserObjectType,
  //   @Requester() requester: RequesterDTO,
  // ) {
  //   if (
  //     requester.isUser &&
  //     requester.payload.id.toString() != user._id.toString()
  //   ) {
  //     return null;
  //   }
  //   return this.userBalanceTransactionService.sumTotalBalanceByUserId(user._id);
  // }
}
