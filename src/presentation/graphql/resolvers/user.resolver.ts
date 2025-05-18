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
  UserLoginInputType,
  UserRegistrationInputType,
} from '../input-types/users';
import { QueryGetListInputType } from '../input-types/base';
import { UserLoginService } from '@domain/user/services/user-login.service';
import { LoginUserObjectType } from '../object-types';

@Resolver(UserObjectType)
export class UserResolver {
  constructor(
    private readonly userLoginService: UserLoginService,
    //private readonly userBalanceTransactionService: UserBalanceTransactionService,
  ) {}

  // @Query(() => UserPaginateObjectType)
  // @GraphqlAuthApi()
  // @GraphqlAccountType([EAccountType.ADMIN])
  // async getAllUsers(
  //   @Args(QueryGetListInputType.name, { nullable: true })
  //   queryGetListInput: QueryGetListInputType,
  // ) {
  //   return await this.userService.fetch(queryGetListInput);
  // }

  @Query(() => UserObjectType)
  @GraphqlAuthApi()
  async getOneUserById(@Args('_id', { type: () => String }) _id: string) {
    // return this.userService.findOneById(_id);
  }

  // @Query(() => UserObjectType)
  // @GraphqlAuthApi()
  // async getMyInformation(@Requester() requester: RequesterDTO) {
  //   return requester.getUser();
  // }

  // @Mutation(() => UserLoginInputType)
  // async registerUser(
  //   @Args(UserRegistrationInputType.name)
  //   userRegistrationInput: UserRegistrationInputType,
  // ): Promise<UserLoginInputType> {
  //   return this.userService.userRegister(userRegistrationInput);
  // }

  @Mutation(() => LoginUserObjectType)
  async loginUser(
    @Args(UserLoginInputType.name) userLoginInput: UserLoginInputType,
  ): Promise<LoginUserObjectType> {
    return this.userLoginService.userLogin(userLoginInput);
  }

  // @ResolveField()
  // @GraphqlAuthApi()
  // totalBalance(@Parent() user: UserObjectType, @Requester() requester: RequesterDTO) {
  //   if (
  //     requester.isUser &&
  //     requester.payload.id.toString() != user._id.toString()
  //   ) {
  //     return null;
  //   }
  //   return this.userBalanceTransactionService.sumTotalBalanceByUserId(user._id);
  // }
}
