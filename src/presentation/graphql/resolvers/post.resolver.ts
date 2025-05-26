import {
  FetchPostUseCase,
  GetOnePostByConditionUseCase,
  CreatePostUseCase,
  UpdateOnePostByConditionUseCase,
  DeleteOnePostByConditionUseCase,
} from '@application';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphqlAuthApi, GraphqlAccountType } from '@shared/decorators';
import { _idArg, DataArg } from '../arguments';

import {
  CreatePostInputType,
  UpdatePostInputType,
  QueryGetListInputType,
} from '../input-types';
import { PostObjectType, PostPaginateObjectType } from '../object-types';

@Resolver(PostObjectType)
export class PostResolver {
  constructor(
    private readonly fetchPostUseCase: FetchPostUseCase,
    private readonly getOnePostByConditionUseCase: GetOnePostByConditionUseCase,
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updateOnePostByConditionUseCase: UpdateOnePostByConditionUseCase,
    private readonly deleteOnePostByConditionUseCase: DeleteOnePostByConditionUseCase,
  ) {}

  @Query(() => PostPaginateObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async getAllPosts(
    @Args(QueryGetListInputType.name, { nullable: true })
    queryGetListInput: QueryGetListInputType,
  ) {
    return await this.fetchPostUseCase.execute(queryGetListInput);
  }

  @Query(() => PostObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async getOnePostById(@_idArg() _id: string) {
    return this.getOnePostByConditionUseCase.execute({ _id });
  }

  @Mutation(() => PostObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async createPost(@DataArg() data: CreatePostInputType) {
    return this.createPostUseCase.execute(data);
  }

  @Mutation(() => PostObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async updateOnePostById(
    @_idArg() _id: string,
    @DataArg() data: UpdatePostInputType,
  ) {
    return this.updateOnePostByConditionUseCase.execute({ _id }, data);
  }

  @Mutation(() => PostObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async deleteOnePostById(@_idArg() _id: string) {
    return this.deleteOnePostByConditionUseCase.execute({ _id });
  }
}
