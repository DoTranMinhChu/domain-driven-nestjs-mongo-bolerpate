#!/usr/bin/env node

/**
 * scripts/scaffold.js
 * CLI generator cho Domain-Driven Design feature scaffold trong NestJS
 *
 * Bây giờ sẽ:
 *  1. Sử dụng prompt tương tác để hỏi tên Feature
 *  2. Tạo domain, infrastructure, application, presentation folders/files
 *  3. Populate mỗi file với template boilerplate
 *  4. Append export statements vào index.ts tương ứng
 *  5. Gọi updateGraphqlModule để đăng ký module và resolver vào GraphqlModule
 *  6. Sau khi updateGraphqlModule xong, tự động format file TypeScript với Prettier (đồng bộ)
 */

const fs = require('fs-extra');
const path = require('path');
const { pascalCase, camelCase, kebabCase } = require('change-case');
const { Project, SyntaxKind, QuoteKind } = require('ts-morph');
const { createPromptModule } = require('inquirer');
const prompt = createPromptModule();
const prettier = require('prettier');

/**
 * formatWithPrettierSync:
 *   - Đọc file đồng bộ (readFileSync)
 *   - Lấy config Prettier đồng bộ (resolveConfigSync)
 *   - Format (prettier.format)
 *   - Ghi file đồng bộ (writeFileSync)
 */
async function formatWithPrettierSync(filePath) {
  try {
    // 1. Đọc nội dung gốc (đồng bộ)
    const original = fs.readFileSync(filePath, 'utf-8');
    console.log(`📄 Reading ${filePath}...`);
    // 2. Lấy config Prettier nếu có (resolveConfigSync trả về object hoặc undefined)
    let options = {};
    if (typeof prettier.resolveConfigSync === 'function') {
      const rc = prettier.resolveConfigSync(filePath);
      if (rc && typeof rc === 'object') {
        options = rc;
      }
    }

    // 3. Format string đã đọc
    const formatted = await prettier.format(original, {
      ...options,
      parser: 'typescript',
      filepath: filePath,
    });

    // 4. Ghi ngược lại file (đồng bộ)
    fs.writeFileSync(filePath, formatted, 'utf-8');
    console.log(`✨ Formatted ${filePath} with Prettier`);
  } catch (err) {
    console.error(`❌ Prettier formatting failed for ${filePath}:`, err);
  }
}

async function main() {
  // 1) Hỏi tên feature nếu không có tham số CLI
  let inputName = null;

  if (process.argv.length >= 3) {
    // Nếu truyền tham số CLI: node scaffold.js WalletTransaction
    inputName = process.argv[2];
  } else {
    // Ngược lại, hiển thị prompt yêu cầu nhập tên Feature
    const answers = await prompt([
      {
        type: 'input',
        name: 'featureName',
        message: 'Nhập tên Feature (ví dụ: WalletTransaction):',
        validate: (val) => {
          if (!val || val.trim().length === 0) {
            return 'Tên feature không được để trống';
          }
          return true;
        },
      },
    ]);
    inputName = answers.featureName.trim();
  }

  // Normalize tên
  const Feature = pascalCase(inputName); // Ví dụ: WalletTransaction
  const feature = camelCase(inputName); // Ví dụ: walletTransaction
  const featureKebab = kebabCase(inputName); // Ví dụ: wallet-transaction
  const featureData = { Feature, feature, featureKebab };

  // Base src path
  const root = path.resolve(__dirname, '../src');
  const files = {
    index: `index`,
    fileModule: `${featureKebab}.module`,
    fileARepo: `${featureKebab}.repository.abstract`,
    fileRepo: `${featureKebab}.repository`,
    fileService: `${featureKebab}.service`,
    fileValueObject: `${featureKebab}.value-object`,
    fileSchema: `${featureKebab}.schema`,
    fileCreateUseCase: `create-${featureKebab}.use-case`,
    fileFetchUseCase: `fetch-${featureKebab}.use-case`,
    fileGetOneUseCase: `get-one-${featureKebab}-by-condition.use-case`,
    fileUpdateOneUseCase: `update-one-${featureKebab}-by-condition.use-case`,
    fileDeleteOneUseCase: `delete-one-${featureKebab}-by-condition.use-case`,
  };

  // Paths configuration
  const paths = {
    /*** Domain Layer ***/
    domainDir: path.join(root, 'domain', featureKebab),
    domainRepoDir: path.join(root, 'domain', featureKebab, 'repositories'),
    domainServiceDir: path.join(root, 'domain', featureKebab, 'services'),
    domainValueObjectDir: path.join(
      root,
      'domain',
      featureKebab,
      'value-objects',
    ),

    /*** Infrastructure Layer ***/
    infraSchemaDir: path.join(root, 'infrastructure', 'mongoose', 'schemas'),
    infraRepoDir: path.join(root, 'infrastructure', 'mongoose', 'repositories'),

    /*** Application Layer ***/
    appDir: path.join(root, 'application'),
    appUseCasesDir: path.join(root, 'application', featureKebab, 'use-cases'),
    appModuleDir: path.join(root, 'application', featureKebab),

    /*** Presentation GraphQL Layer ***/
    presentationGraphQLDir: path.join(root, 'presentation', 'graphql'),
    presentationGraphQLInputTypesDir: path.join(
      root,
      'presentation',
      'graphql',
      'input-types',
    ),
    presentationGraphQLInputTypeDir: path.join(
      root,
      'presentation',
      'graphql',
      'input-types',
      featureKebab,
    ),
    presentationGraphQLObjectTypesDir: path.join(
      root,
      'presentation',
      'graphql',
      'object-types',
    ),
    presentationGraphQLObjectTypeDir: path.join(
      root,
      'presentation',
      'graphql',
      'object-types',
      featureKebab,
    ),
    presentationGraphQLResolversDir: path.join(
      root,
      'presentation',
      'graphql',
      'resolvers',
    ),
  };

  /********** 1. Infrastructure Layer **********/

  // ---- infrastructure/mongoose/schemas/<feature>.schema.ts ---
  await fs.ensureDir(paths.infraSchemaDir);
  writeNewFile(
    path.join(paths.infraSchemaDir, `${files.fileSchema}.ts`),
    infraSchemaTs(featureData),
  );
  await appendToIndex(path.join(paths.infraSchemaDir, `${files.index}.ts`), [
    `export * from './${files.fileSchema}';`,
  ]);

  // ---- infrastructure/mongoose/repositories/<feature>.repository.ts ---
  await fs.ensureDir(paths.infraRepoDir);
  writeNewFile(
    path.join(paths.infraRepoDir, `${files.fileRepo}.ts`),
    infraRepositoryTs(featureData),
  );
  await appendToIndex(path.join(paths.infraRepoDir, `${files.index}.ts`), [
    `export * from './${files.fileRepo}';`,
  ]);

  /********** 2. Domain Layer **********/
  await fs.ensureDir(paths.domainDir);

  // ---- domain/<feature>/repositories ---
  await fs.ensureDir(paths.domainRepoDir);
  writeNewFile(
    path.join(paths.domainRepoDir, `${files.fileARepo}.ts`),
    domainARepositoryTs(featureData),
  );
  writeNewFile(
    path.join(paths.domainRepoDir, `${files.index}.ts`),
    writeIndexTs([files.fileARepo]),
  );

  // ---- domain/<feature>/services ---
  await fs.ensureDir(paths.domainServiceDir);
  writeNewFile(
    path.join(paths.domainServiceDir, `${files.fileService}.ts`),
    domainServiceTs(featureData),
  );
  writeNewFile(
    path.join(paths.domainServiceDir, `${files.index}.ts`),
    writeIndexTs([files.fileService]),
  );

  // ---- domain/<feature>/value-objects ---
  await fs.ensureDir(paths.domainValueObjectDir);
  writeNewFile(
    path.join(paths.domainValueObjectDir, `${files.fileValueObject}.ts`),
    domainValueObjectTs(featureData),
  );
  writeNewFile(
    path.join(paths.domainValueObjectDir, `${files.index}.ts`),
    writeIndexTs([files.fileValueObject]),
  );

  // ---- domain/<feature>/<feature>.module.ts ---
  writeNewFile(
    path.join(paths.domainDir, `${files.fileModule}.ts`),
    domainModuleTs(featureData),
  );

  /********** 3. Application Layer **********/

  // ---- application/<feature>/use-cases ---
  await fs.ensureDir(paths.appUseCasesDir);

  writeNewFile(
    path.join(paths.appUseCasesDir, `${files.fileCreateUseCase}.ts`),
    createUseCaseTs(featureData),
  );
  writeNewFile(
    path.join(paths.appUseCasesDir, `${files.fileFetchUseCase}.ts`),
    fetchUseCaseTs(featureData),
  );
  writeNewFile(
    path.join(paths.appUseCasesDir, `${files.fileGetOneUseCase}.ts`),
    getOneUseCaseTs(featureData),
  );
  writeNewFile(
    path.join(paths.appUseCasesDir, `${files.fileUpdateOneUseCase}.ts`),
    updateOneUseCaseTs(featureData),
  );
  writeNewFile(
    path.join(paths.appUseCasesDir, `${files.fileDeleteOneUseCase}.ts`),
    deleteOneUseCaseTs(featureData),
  );

  writeNewFile(
    path.join(paths.appUseCasesDir, `${files.index}.ts`),
    writeIndexTs([
      files.fileCreateUseCase,
      files.fileFetchUseCase,
      files.fileGetOneUseCase,
      files.fileUpdateOneUseCase,
      files.fileDeleteOneUseCase,
    ]),
  );
  await appendToIndex(path.join(paths.appDir, `${files.index}.ts`), [
    `export * from './${featureKebab}';`,
  ]);

  // ---- application/<feature>/index.ts & module.ts ---
  await fs.ensureDir(paths.appModuleDir);
  writeNewFile(
    path.join(paths.appModuleDir, `${files.index}.ts`),
    writeIndexTs([files.fileModule, 'use-cases']),
  );
  writeNewFile(
    path.join(paths.appModuleDir, `${files.fileModule}.ts`),
    applicationModuleTs(featureData),
  );

  /********** 4. Presentation Layer (GraphQL) **********/

  // ---- input-types/create-<feature>.input-type.ts & update-<feature>.input-type.ts ---
  await fs.ensureDir(paths.presentationGraphQLInputTypeDir);
  writeNewFile(
    path.join(
      paths.presentationGraphQLInputTypeDir,
      `create-${featureKebab}.input-type.ts`,
    ),
    graphQLInputTypeTs('Create', featureData),
  );
  writeNewFile(
    path.join(
      paths.presentationGraphQLInputTypeDir,
      `update-${featureKebab}.input-type.ts`,
    ),
    graphQLInputTypeTs('Update', featureData),
  );
  writeNewFile(
    path.join(paths.presentationGraphQLInputTypeDir, `${files.index}.ts`),
    writeIndexTs([
      `create-${featureKebab}.input-type`,
      `update-${featureKebab}.input-type`,
    ]),
  );
  await appendToIndex(
    path.join(paths.presentationGraphQLInputTypesDir, `${files.index}.ts`),
    [`export * from './${featureKebab}';`],
  );

  // ---- object-types/<feature>.object-type.ts ---
  await fs.ensureDir(paths.presentationGraphQLObjectTypeDir);
  writeNewFile(
    path.join(
      paths.presentationGraphQLObjectTypeDir,
      `${featureKebab}.object-type.ts`,
    ),
    graphQLObjectTypeTs(featureData),
  );
  writeNewFile(
    path.join(paths.presentationGraphQLObjectTypeDir, `${files.index}.ts`),
    writeIndexTs([`${featureKebab}.object-type`]),
  );
  await appendToIndex(
    path.join(paths.presentationGraphQLObjectTypesDir, `${files.index}.ts`),
    [`export * from './${featureKebab}';`],
  );

  // ---- resolvers/<feature>.resolver.ts ---
  await fs.ensureDir(paths.presentationGraphQLResolversDir);
  writeNewFile(
    path.join(
      paths.presentationGraphQLResolversDir,
      `${featureKebab}.resolver.ts`,
    ),
    graphQLResolverTs(featureData),
  );
  await appendToIndex(
    path.join(paths.presentationGraphQLResolversDir, 'index.ts'),
    [`export * from './${featureKebab}.resolver';`],
  );

  /********** 5. Update GraphqlModule **********/
  const graphqlModulePath = path.join(
    paths.presentationGraphQLDir,
    'graphql.module.ts',
  );
  await updateGraphqlModule(graphqlModulePath, featureData);

  console.log(`✅ Scaffold cho ${Feature} đã được tạo thành công.`);
}

main().catch((err) => {
  console.error('❌ Đã xảy ra lỗi khi scaffold:', err);
  process.exit(1);
});

/** Append lines vào index.ts, tránh duplicate **/
async function appendToIndex(indexPath, lines) {
  let content = '';
  if (await fs.pathExists(indexPath)) {
    content = await fs.readFile(indexPath, 'utf-8');
  }
  for (const line of lines) {
    if (!content.includes(line)) {
      content += (content.endsWith('\n') ? '' : '\n') + line + '\n';
    }
  }
  await fs.writeFile(indexPath, content);
  console.log(`✔️  Updated ${indexPath}`);
}

function writeNewFile(file, data) {
  fs.writeFileSync(file, data);
  console.log(`✔️  Created ${file}`);
}

/** ============= Templates =========== **/

function writeIndexTs(paths) {
  return paths.map((p) => `export * from './${p}';`).join('\n');
}

/********* DOMAIN LAYER *********/

// domain/<feature>/repositories/<feature>.repository.abstract.ts
function domainARepositoryTs({ Feature, feature, featureKebab }) {
  return `import { AMongooseBaseRepository } from '@infrastructure/mongoose';
import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';

export abstract class A${Feature}Repository extends AMongooseBaseRepository<${Feature}Schema> {}`;
}

// domain/<feature>/services/<feature>.service.ts
function domainServiceTs({ Feature, feature, featureKebab }) {
  return `import { MongooseBaseService } from '@infrastructure/mongoose';
import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';
import { Inject, Injectable } from '@nestjs/common';
import { A${Feature}Repository } from '../repositories/${featureKebab}.repository.abstract';

@Injectable()
export class ${Feature}Service extends MongooseBaseService<${Feature}Schema> {
  constructor(
    @Inject(A${Feature}Repository)
    private readonly ${feature}Repository: A${Feature}Repository,
  ) {
    super(${feature}Repository);
  }
}
`;
}

// domain/<feature>/value-objects/<feature>.value-object.ts
function domainValueObjectTs({ Feature, feature, featureKebab }) {
  return `import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';
import { ABaseValueObject } from '@shared/value-objects';

export class ${Feature}ValueObject extends ABaseValueObject<${Feature}Schema> {
  protected override validate(_value: ${Feature}Schema): void {}
}`;
}

// domain/<feature>/<feature>.module.ts
function domainModuleTs({ Feature, feature, featureKebab }) {
  return `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ${Feature}Schema,
  ${Feature}SchemaFactory,
} from '@infrastructure/mongoose/schemas';
import { ${Feature}Repository } from '@infrastructure/mongoose/repositories';
import { A${Feature}Repository } from './repositories';
import { ${Feature}Service } from './services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ${Feature}Schema.name, schema: ${Feature}SchemaFactory },
    ]),
  ],
  providers: [
    { provide: A${Feature}Repository, useClass: ${Feature}Repository },
    ${Feature}Service,
  ],
  exports: [A${Feature}Repository, ${Feature}Service],
})
export class Domain${Feature}Module {}
`;
}

/********* INFRASTRUCTURE LAYER *********/

// infrastructure/mongoose/schemas/<feature>.schema.ts
function infraSchemaTs({ Feature, feature, featureKebab }) {
  return `import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseBaseSchema } from '../mongoose-base';

@Schema({
  timestamps: true,
  collection: '${featureKebab}',
})
export class ${Feature}Schema extends MongooseBaseSchema {
  @Prop({})
  name!: string;
}

export const ${Feature}SchemaFactory = SchemaFactory.createForClass(${Feature}Schema);
${Feature}SchemaFactory.index({ name: 'text' }, { weights: { name: 1 } });`;
}

// infrastructure/mongoose/repositories/<feature>.repository.ts
function infraRepositoryTs({ Feature, feature, featureKebab }) {
  return `import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongooseBaseRepository } from '../mongoose-base';
import { ${Feature}Schema } from '../schemas';

@Injectable()
export class ${Feature}Repository extends MongooseBaseRepository<${Feature}Schema> {
  constructor(
    @InjectModel(${Feature}Schema.name)
    private readonly ${feature}Model: Model<${Feature}Schema>,
  ) {
    super(${feature}Model);
  }
}`;
}

/********* APPLICATION LAYER *********/

// application/<feature>/use-cases/create-<feature>.use-case.ts
function createUseCaseTs({ Feature, feature, featureKebab }) {
  return `import { ${Feature}Service } from '@domain/${featureKebab}/services';
import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Create${Feature}UseCase {
  constructor(private readonly ${feature}Service: ${Feature}Service) {}

  async execute(createData: Partial<${Feature}Schema>) {
    return this.${feature}Service.create(createData);
  }
}`;
}

// application/<feature>/use-cases/fetch-<feature>.use-case.ts
function fetchUseCaseTs({ Feature, feature, featureKebab }) {
  return `import { ${Feature}Service } from '@domain/${featureKebab}/services';
import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { IQueryGetListInputType } from '@shared/interfaces';

@Injectable()
export class Fetch${Feature}UseCase {
  constructor(private readonly ${feature}Service: ${Feature}Service) {}

  async execute(queryInput: IQueryGetListInputType<${Feature}Schema>) {
    return this.${feature}Service.fetch(queryInput);
  }
}`;
}

// application/<feature>/use-cases/get-one-<feature>-by-condition.use-case.ts
function getOneUseCaseTs({ Feature, feature, featureKebab }) {
  return `import { ${Feature}Service } from '@domain/${featureKebab}/services';
import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class GetOne${Feature}ByConditionUseCase {
  constructor(private readonly ${feature}Service: ${Feature}Service) {}

  async execute(condition: FilterQuery<${Feature}Schema>) {
    return this.${feature}Service.findOne(condition);
  }
}`;
}

// application/<feature>/use-cases/update-one-<feature>-by-condition.use-case.ts
function updateOneUseCaseTs({ Feature, feature, featureKebab }) {
  return `import { ${Feature}Service } from '@domain/${featureKebab}/services';
import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';

@Injectable()
export class UpdateOne${Feature}ByConditionUseCase {
  constructor(private readonly ${feature}Service: ${Feature}Service) {}

  async execute(
    condition: FilterQuery<${Feature}Schema>,
    updateData: UpdateQuery<${Feature}Schema>,
  ) {
    return this.${feature}Service.updateOneWithCondition(condition, updateData);
  }
}`;
}

// application/<feature>/use-cases/delete-one-<feature>-by-condition.use-case.ts
function deleteOneUseCaseTs({ Feature, feature, featureKebab }) {
  return `import { ${Feature}Service } from '@domain/${featureKebab}/services';
import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class DeleteOne${Feature}ByConditionUseCase {
  constructor(private readonly ${feature}Service: ${Feature}Service) {}

  async execute(condition: FilterQuery<${Feature}Schema>) {
    return this.${feature}Service.softDeleteByCondition(condition);
  }
}`;
}

// application/<feature>/<feature>.module.ts
function applicationModuleTs({ Feature, feature, featureKebab }) {
  return `import { Domain${Feature}Module } from '@domain/${featureKebab}/${featureKebab}.module';
import {
  Create${Feature}UseCase,
  DeleteOne${Feature}ByConditionUseCase,
  Fetch${Feature}UseCase,
  GetOne${Feature}ByConditionUseCase,
  UpdateOne${Feature}ByConditionUseCase,
} from '@application/${featureKebab}/use-cases';
import { Module } from '@nestjs/common';

@Module({
  imports: [Domain${Feature}Module],
  providers: [
    Fetch${Feature}UseCase,
    GetOne${Feature}ByConditionUseCase,
    Create${Feature}UseCase,
    UpdateOne${Feature}ByConditionUseCase,
    DeleteOne${Feature}ByConditionUseCase,
  ],
  exports: [
    Domain${Feature}Module,
    Fetch${Feature}UseCase,
    GetOne${Feature}ByConditionUseCase,
    Create${Feature}UseCase,
    UpdateOne${Feature}ByConditionUseCase,
    DeleteOne${Feature}ByConditionUseCase,
  ],
})
export class Application${Feature}Module {}`;
}

/********* PRESENTATION LAYER (GraphQL) *********/

function graphQLInputTypeTs(prefix, { Feature, feature, featureKebab }) {
  return `import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ${prefix}${Feature}InputType {
  @Field(() => String)
  name!: string;
}`;
}

function graphQLObjectTypeTs({ Feature, feature, featureKebab }) {
  return `import { Field, ObjectType } from '@nestjs/graphql';
import { MongooseBaseObjectType } from '@infrastructure/mongoose/mongoose-base';
import { PaginateDataObjectType } from '..';

@ObjectType()
export class ${Feature}ObjectType extends MongooseBaseObjectType {
  @Field(() => String)
  name!: string;
}
@ObjectType()
export class ${Feature}PaginateObjectType extends PaginateDataObjectType(
  ${Feature}ObjectType,
) {}`;
}

function graphQLResolverTs({ Feature, feature, featureKebab }) {
  return `import {
  Fetch${Feature}UseCase,
  GetOne${Feature}ByConditionUseCase,
  Create${Feature}UseCase,
  UpdateOne${Feature}ByConditionUseCase,
  DeleteOne${Feature}ByConditionUseCase,
} from '@application';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphqlAuthApi, GraphqlAccountType } from '@shared/decorators';
import { _idArg, DataArg } from '../arguments';

import {
  Create${Feature}InputType,
  Update${Feature}InputType,
  QueryGetListInputType,
} from '../input-types';
import { ${Feature}ObjectType, ${Feature}PaginateObjectType } from '../object-types';

@Resolver(${Feature}ObjectType)
export class ${Feature}Resolver {
  constructor(
    private readonly fetch${Feature}UseCase: Fetch${Feature}UseCase,
    private readonly getOne${Feature}ByConditionUseCase: GetOne${Feature}ByConditionUseCase,
    private readonly create${Feature}UseCase: Create${Feature}UseCase,
    private readonly updateOne${Feature}ByConditionUseCase: UpdateOne${Feature}ByConditionUseCase,
    private readonly deleteOne${Feature}ByConditionUseCase: DeleteOne${Feature}ByConditionUseCase,
  ) {}

  @Query(() => ${Feature}PaginateObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async getAll${Feature}(
    @Args(QueryGetListInputType.name, { nullable: true })
    queryGetListInput: QueryGetListInputType,
  ) {
    return await this.fetch${Feature}UseCase.execute(queryGetListInput);
  }

  @Query(() => ${Feature}ObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async getOne${Feature}ById(@_idArg() _id: string) {
    return this.getOne${Feature}ByConditionUseCase.execute({ _id });
  }

  @Mutation(() => ${Feature}ObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async create${Feature}(@DataArg() data: Create${Feature}InputType) {
    return this.create${Feature}UseCase.execute(data);
  }

  @Mutation(() => ${Feature}ObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async updateOne${Feature}ById(
    @_idArg() _id: string,
    @DataArg() data: Update${Feature}InputType,
  ) {
    return this.updateOne${Feature}ByConditionUseCase.execute({ _id }, data);
  }

  @Mutation(() => ${Feature}ObjectType)
  @GraphqlAuthApi()
  @GraphqlAccountType([])
  async deleteOne${Feature}ById(@_idArg() _id: string) {
    return this.deleteOne${Feature}ByConditionUseCase.execute({ _id });
  }
}`;
}

/** ============= Cập nhật GraphqlModule + Auto-Format =========== **/
async function updateGraphqlModule(pathFile, { Feature, feature }) {
  // Dùng ts-morph để load và chỉnh sửa
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
  });

  const sourceFile = project.getSourceFileOrThrow(pathFile);
  const resolverName = `${Feature}Resolver`;
  const appModuleName = `Application${Feature}Module`;

  // --- Thêm import từ './resolvers' ---
  let dec1 = sourceFile.getImportDeclaration(
    (d) => d.getModuleSpecifierValue() === './resolvers',
  );
  if (dec1) {
    const names = dec1.getNamedImports().map((n) => n.getName());
    if (!names.includes(resolverName)) {
      dec1.addNamedImport(resolverName);
    }
  } else {
    sourceFile.addImportDeclaration({
      namedImports: [resolverName],
      moduleSpecifier: './resolvers',
      quoteKind: QuoteKind.Single,
    });
  }

  // --- Thêm import từ '@application' ---
  let dec2 = sourceFile.getImportDeclaration(
    (d) => d.getModuleSpecifierValue() === '@application',
  );
  if (dec2) {
    const names = dec2.getNamedImports().map((n) => n.getName());
    if (!names.includes(appModuleName)) {
      dec2.addNamedImport(appModuleName);
    }
  } else {
    sourceFile.addImportDeclaration({
      namedImports: [appModuleName],
      moduleSpecifier: '@application',
      quoteKind: QuoteKind.Single,
    });
  }

  // --- Tìm class GraphqlModule và decorator @Module ---
  const gqlClass = sourceFile.getClassOrThrow('GraphqlModule');
  const modDec = gqlClass.getDecoratorOrThrow('Module');
  const arg = modDec.getArguments()[0];
  const obj = arg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

  // --- Xử lý imports array ---
  let impProp = obj.getProperty('imports');
  if (!impProp) {
    obj.addPropertyAssignment({
      name: 'imports',
      initializer: `[${appModuleName}]`,
    });
  } else {
    const arr = impProp.getInitializerIfKindOrThrow(
      SyntaxKind.ArrayLiteralExpression,
    );
    const elems = arr.getElements().map((e) => e.getText());
    if (!elems.includes(appModuleName)) {
      arr.addElement(appModuleName);
    }
  }

  // --- Xử lý providers array ---
  let provProp = obj.getProperty('providers');
  if (!provProp) {
    obj.addPropertyAssignment({
      name: 'providers',
      initializer: `[${resolverName}]`,
    });
  } else {
    const arr = provProp.getInitializerIfKindOrThrow(
      SyntaxKind.ArrayLiteralExpression,
    );
    const elems = arr.getElements().map((e) => e.getText());
    if (!elems.includes(resolverName)) {
      arr.addElement(resolverName);
    }
  }

  // --- Lưu file (đồng bộ) trước khi format ---
  sourceFile.saveSync();
  console.log(`✅ Đã thêm ${resolverName} & ${appModuleName} vào ${pathFile}`);

  // --- Tự động format lại file bằng Prettier (đồng bộ) ---
  await formatWithPrettierSync(pathFile);
}
