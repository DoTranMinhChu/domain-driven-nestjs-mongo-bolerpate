import {
  FetchAdminUseCase,
  GetOneAdminByConditionUseCase,
  CreateAdminUseCase,
  UpdateOneAdminByConditionUseCase,
  DeleteOneAdminByConditionUseCase,
} from '@application';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphqlAuthApi, GraphqlAccountType } from '@shared/decorators';
import { _idArg, DataArg } from '../arguments';

import {
  CreateAdminInputType,
  UpdateAdminInputType,
  QueryGetListInputType,
} from '../input-types';
import { AdminObjectType, AdminPaginateObjectType } from '../object-types';

@Resolver(AdminObjectType)
export class AdminResolver {
  constructor(
    private readonly fetchAdminUseCase: FetchAdminUseCase,
    private readonly getOneAdminByConditionUseCase: GetOneAdminByConditionUseCase,
    private readonly createAdminUseCase: CreateAdminUseCase,
    private readonly updateOneAdminByConditionUseCase: UpdateOneAdminByConditionUseCase,
    private readonly deleteOneAdminByConditionUseCase: DeleteOneAdminByConditionUseCase,
  ) {}

  @Query(() => AdminPaginateObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async getAllAdmin(
    @Args(QueryGetListInputType.name, { nullable: true })
    queryGetListInput: QueryGetListInputType,
  ) {
    return await this.fetchAdminUseCase.execute(queryGetListInput);
  }

  @Query(() => AdminObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async getOneAdminById(@_idArg() _id: string) {
    return this.getOneAdminByConditionUseCase.execute({ _id });
  }

  @Mutation(() => AdminObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async createAdmin(@DataArg() data: CreateAdminInputType) {
    return this.createAdminUseCase.execute(data);
  }

  @Mutation(() => AdminObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async updateOneAdminById(
    @_idArg() _id: string,
    @DataArg() data: UpdateAdminInputType,
  ) {
    return this.updateOneAdminByConditionUseCase.execute({ _id }, data);
  }

  @Mutation(() => AdminObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async deleteOneAdminById(@_idArg() _id: string) {
    return this.deleteOneAdminByConditionUseCase.execute({ _id });
  }
}