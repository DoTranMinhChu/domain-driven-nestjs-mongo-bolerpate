#!/usr/bin/env node

/**
 * scripts/scaffold.js
 * CLI generator for Domain-Driven Design feature scaffolding in NestJS
 *
 * Usage:
 *   npm run scaffold -- FeatureName
 *
 * This script will:
 *  1. Create domain, infrastructure, application, presentation folders/files
 *  2. Populate each file with boilerplate templates
 *  3. Append export statements in index.ts files
 *  4. Register new modules and resolvers in GraphqlModule
 */

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const {
  pascalCase,
  camelCase,
  kebabCase,
  constantCase,
} = require('change-case');

program
  .name('scaffold')
  .arguments('<feature>')
  .description('Generate DDD folders/files for a given feature/schema name')
  .action(async (inputName) => {
    // Normalize names
    const Feature = pascalCase(inputName); // e.g. WalletTransaction
    const feature = camelCase(inputName); // e.g. walletTransaction
    const featureKebab = kebabCase(inputName); // e.g. wallet-transaction
    const moduleClass = `${Feature}Module`; // e.g. WalletTransactionModule
    const resolverClass = `${Feature}Resolver`; // e.g. WalletTransactionResolver
    const featureData = {
      Feature,
      feature,
      featureKebab,
    };
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
      fileCreateUseCase: `create-${featureKebab}.user-case`,
      fileFetchUseCase: `fetch-${featureKebab}.user-case`,
      fileGetOneUseCase: `get-one-${featureKebab}-by-condition.user-case`,
      fileUpdateOneUseCase: `update-one-${featureKebab}-by-condition.user-case`,
      fileDeleteOneUseCase: `delete-one-${featureKebab}-by-condition.user-case`,
    };
    // Paths configuration
    const paths = {
      /**** Domain Layer****/
      domainDir: path.join(root, 'domain', featureKebab),
      domainRepoDir: path.join(root, 'domain', featureKebab, 'repositories'),
      domainServiceDir: path.join(root, 'domain', featureKebab, 'services'),
      domainValueObjectDir: path.join(
        root,
        'domain',
        featureKebab,
        'value-objects',
      ),

      //
      infraSchemaDir: path.join(root, 'infrastructure', 'mongoose', 'schemas'),
      infraRepoDir: path.join(
        root,
        'infrastructure',
        'mongoose',
        'repositories',
      ),
      appUseCasesDir: path.join(root, 'application', featureKebab, 'use-cases'),
      appModuleDir: path.join(root, 'application', featureKebab),
      gqlInputDir: path.join(
        root,
        'presentation',
        'graphql',
        'input-types',
        featureKebab,
      ),
      gqlObjectDir: path.join(
        root,
        'presentation',
        'graphql',
        'object-types',
        featureKebab,
      ),
      gqlResolverDir: path.join(root, 'presentation', 'graphql', 'resolvers'),
      gqlModuleFile: path.join(
        root,
        'presentation',
        'graphql',
        'graphql.module.ts',
      ),
    };

    /********** 1. Infrastructure Layer **********/

    /* ---- infrastructure/mongoose/schemas/__name__.schema.ts ---*/
    await fs.ensureDir(paths.infraSchemaDir);
    await fs.writeFile(
      path.join(paths.infraSchemaDir, `${files.fileSchema}.ts`),
      infraSchemaTs(featureData),
    );
    await appendToIndex(path.join(paths.infraSchemaDir, `${files.index}.ts`), [
      `export * from './${files.fileSchema}';`,
    ]);

    /* ---- infrastructure/mongoose/repositories/__name__.repository.ts ---*/
    // Repositories
    await fs.ensureDir(paths.infraRepoDir);
    await fs.writeFile(
      path.join(paths.infraRepoDir, `${files.fileRepo}.ts`),
      infraRepositoryTs(featureData),
    );
    await appendToIndex(path.join(paths.infraRepoDir, `${files.index}.ts`), [
      `export * from './${files.fileRepo}';`,
    ]);

    /********** 2. Domain Layer **********/
    await fs.ensureDir(paths.domainDir);

    /* ---- domain/__name__/repositories ---*/
    await fs.ensureDir(paths.domainRepoDir);
    await fs.writeFile(
      path.join(paths.domainRepoDir, `${files.fileARepo}.ts`),
      domainARepositoryTs(featureData),
    );
    await fs.writeFile(
      path.join(paths.domainRepoDir, `${files.index}.ts`),
      writeIndexTs([files.fileARepo]),
    );
    /* ---- domain/__name__/services ---*/
    await fs.ensureDir(paths.domainServiceDir);
    await fs.writeFile(
      path.join(paths.domainServiceDir, `${files.fileService}.ts`),
      domainServiceTs(featureData),
    );
    await fs.writeFile(
      path.join(paths.domainServiceDir, `${files.index}.ts`),
      writeIndexTs([files.fileService]),
    );
    /* ---- domain/__name__/value-objects ---*/
    await fs.ensureDir(paths.domainValueObjectDir);
    await fs.writeFile(
      path.join(paths.domainValueObjectDir, `${files.fileValueObject}.ts`),
      domainValueObjectTs(featureData),
    );
    await fs.writeFile(
      path.join(paths.domainValueObjectDir, `${files.index}.ts`),
      writeIndexTs([files.fileValueObject]),
    );

    /* ---- domain/__name__/__name__.module.ts ---*/
    await fs.writeFile(
      path.join(paths.domainDir, `${files.fileModule}.ts`),
      domainModuleTs(featureData),
    );

    /********** 3. Application Layer **********/
    /* ---- application/__name__/use-cases/action__name__.use-case.ts ---*/
    await fs.ensureDir(paths.appUseCasesDir);

    await fs.writeFile(
      path.join(paths.appUseCasesDir, `${files.fileCreateUseCase}.ts`),
      createUseCaseTs(featureData),
    );
    await fs.writeFile(
      path.join(paths.appUseCasesDir, `${files.fileFetchUseCase}.ts`),
      fetchUseCaseTs(featureData),
    );
    await fs.writeFile(
      path.join(paths.appUseCasesDir, `${files.fileGetOneUseCase}.ts`),
      getOneUseCaseTs(featureData),
    );
    await fs.writeFile(
      path.join(paths.appUseCasesDir, `${files.fileUpdateOneUseCase}.ts`),
      updateOneUseCaseTs(featureData),
    );
    await fs.writeFile(
      path.join(paths.appUseCasesDir, `${files.fileDeleteOneUseCase}.ts`),
      deleteOneUseCaseTs(featureData),
    );

    await fs.writeFile(
      path.join(paths.appUseCasesDir, `${files.index}.ts`),
      writeIndexTs([
        files.fileCreateUseCase,
        files.fileFetchUseCase,
        files.fileGetOneUseCase,
        files.fileUpdateOneUseCase,
        files.fileDeleteOneUseCase,
      ]),
    );

    /* ---- application/__name__/index.ts ---*/
    await fs.ensureDir(paths.appModuleDir);
    await fs.writeFile(
      path.join(paths.appModuleDir, `${files.index}.ts`),
      writeIndexTs([files.moduleFile, 'user-case']),
    );

     /* ---- application/__name__/__name__.module.ts ---*/
    await fs.writeFile(
      path.join(paths.appModuleDir, `${files.fileModule}.ts`),
      applicationModuleTs(featureData),
    );

    // /********** 4. Presentation Layer (GraphQL) **********/
    // // Input Types
    // await fs.ensureDir(paths.gqlInputDir);
    // await fs.writeFile(
    //   path.join(paths.gqlInputDir, `create-${featureKebab}.input-type.ts`),
    //   gqlInputTs('Create', featureData),
    // );
    // // Object Types
    // await fs.ensureDir(paths.gqlObjectDir);
    // await fs.writeFile(
    //   path.join(paths.gqlObjectDir, `${featureKebab}.object-type.ts`),
    //   gqlObjectTs(featureData),
    // );
    // // Resolver
    // await fs.ensureDir(paths.gqlResolverDir);
    // await fs.writeFile(
    //   path.join(paths.gqlResolverDir, `${featureKebab}.resolver.ts`),
    //   gqlResolverTs(featureData),
    // );
    // await appendToIndex(path.join(paths.gqlResolverDir, 'index.ts'), [
    //   `export * from './${featureKebab}.resolver';`,
    // ]);

    // /********** 5. Update GraphqlModule **********/
    // await updateGraphqlModule(paths.gqlModuleFile, featureData);

    console.log(`✅ Scaffold for ${Feature} generated successfully.`);
  });

program.parse(process.argv);

/** Append lines to index.ts, avoid duplicates **/
async function appendToIndex(indexPath, lines) {
  let content = '';
  if (await fs.pathExists(indexPath))
    content = await fs.readFile(indexPath, 'utf-8');
  for (const line of lines) {
    if (!content.includes(line)) {
      content += (content.endsWith('\n') ? '' : '\n') + line + '\n';
    }
  }
  await fs.writeFile(indexPath, content);
}

/** Update GraphqlModule: add import, module and resolver registration **/
async function updateGraphqlModule(moduleFile, Feature, feature) {
  if (!(await fs.pathExists(moduleFile))) {
    console.warn(`GraphqlModule not found at ${moduleFile}, skipping update.`);
    return;
  }
  let text = await fs.readFile(moduleFile, 'utf-8');
  const importModule = `import { ${moduleClass} } from '../../application/${featureKebab}/${featureKebab}.module';`;
  const importResolver = `import { ${resolverClass} } from './resolvers/${featureKebab}.resolver';`;
  // Add imports at top
  if (!text.includes(importModule)) text = importModule + '\n' + text;
  if (!text.includes(importResolver)) text = importResolver + '\n' + text;

  // Insert into @Module imports array
  text = text.replace(
    /(@Module\s*\({[\s\S]*?imports:\s*\[)([\s\S]*?)(\])/m,
    (_, start, middle, end) => {
      const toAdd = `  ${moduleClass},`;
      if (!middle.includes(moduleClass)) middle += '\n' + toAdd;
      return start + middle + end;
    },
  );
  // Insert into providers: []
  text = text.replace(
    /(providers:\s*\[)([\s\S]*?)(\])/m,
    (_, start, middle, end) => {
      const toAdd = `  ${resolverClass},`;
      if (!middle.includes(resolverClass)) middle += '\n' + toAdd;
      return start + middle + end;
    },
  );
  await fs.writeFile(moduleFile, text);
}

/** ============= Templates =========== **/
function writeIndexTs(paths) {
  return paths.map((path) => `export * from './${path}';`).join('\n');
}

/*********DOMAIN LAYER*********/

/*-- domain/__name__/repositories/__name__.repository.abstract.ts--- */
function domainARepositoryTs({ Feature, feature, featureKebab }) {
  return `import { AMongooseBaseRepository } from '@infrastructure/mongoose';
import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';

export abstract class A${Feature}Repository extends AMongooseBaseRepository<${Feature}Schema> {}`;
}

/*-- domain/__name__/repositories/__name__.repository.abstract.ts--- */
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
/*-- domain/__name__/value-objects/__name__.value-object.ts--- */
function domainValueObjectTs({ Feature, feature, featureKebab }) {
  return `import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';
import { ABaseValueObject } from '@shared/value-objects';

export class ${Feature}ValueObject extends ABaseValueObject<${Feature}Schema> {
  protected override validate(_value: ${Feature}Schema): void {}
}`;
}
/*-- domain/__name__/__name__.module.ts --- */
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
/*********INFRASTRUCTURE LAYER*********/

/*-- infrastructure/mongoose/schemas/__name__.schema.ts--- */
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

/*-- infrastructure/mongoose/repositories/__name__.repository.ts--- */
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

/*********APPLICATION LAYER*********/
/*-- application/__name__/user-cases/create-__name__.use-case.ts--- */
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
/*-- application/__name__/user-cases/fetch-__name__.use-case.ts--- */
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
/*-- application/__name__/user-cases/get-one-__name__-by-condition.use-case.ts--- */
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
/*-- application/__name__/user-cases/update-one-__name__-by-condition.use-case.ts--- */
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

/*-- application/__name__/user-cases/delete-one-__name__-by-condition.use-case.ts--- */
function deleteOneUseCaseTs({ Feature, feature, featureKebab }) {
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
/*-- application/__name__/__name__.module.ts--- */
function applicationModuleTs({ Feature, feature, featureKebab }) {
  return `import { Domain${Feature}Module } from '@domain/${featureKebab}/${featureKebab}.module';
import {
  Create${Feature}UseCase,
  DeleteOne${Feature}ByConditionUseCase,
  Fetch${Feature}UseCase,
  GetOne${Feature}ByConditionUseCase,
  UpdateOne${Feature}ByConditionUseCase,
} from './';
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

function gqlInputTs(prefix, { Feature, feature, featureKebab, resolverClass }) {
  return `import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ${prefix}${Feature}Input {
  @Field()
  exampleField: string;
}
`;
}

function gqlObjectTs({ Feature, feature, featureKebab }) {
  return `import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ${Feature}ObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  exampleField: string;
}
`;
}

function gqlResolverTs({ Feature, feature, featureKebab }) {
  return `import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ${Feature}Service } from '../../../domain/${feature}/${feature}.service';
import { ${Feature}ObjectType } from '../object-types/${feature}/${feature}.object-type';
import { Create${Feature}Input } from '../input-types/${feature}/create-${feature}.input-type';

@Resolver(() => ${Feature}ObjectType)
export class ${Feature}Resolver {
  constructor(private readonly service: ${Feature}Service) {}

  @Query(() => [${Feature}ObjectType])
  ${feature}List() {
    return this.service.findAll();
  }

  @Mutation(() => ${Feature}ObjectType)
  create${Feature}(@Args('data') data: Create${Feature}Input) {
    return this.service.create(data);
  }
}
`;
}
