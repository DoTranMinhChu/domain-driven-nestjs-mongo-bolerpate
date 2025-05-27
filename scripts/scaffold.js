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
      moduleClass,
      resolverClass,
    };
    // Base src path
    const root = path.resolve(__dirname, '../src');
    const files = {
      index: `index`,
      fileModule: `${featureKebab}.module`,
      fileARepo: `${featureKebab}.repository.abstract`,
      fileService: `${featureKebab}.service`,
      fileValueObject: `${featureKebab}.value-object`,
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

    /********** 1. Domain Layer **********/
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
    // await fs.writeFile(
    //   path.join(paths.domainDir, `${featureKebab}.entity.ts`),
    //   domainEntityTs(featureData),
    // );
    // await fs.writeFile(
    //   path.join(paths.domainDir, `${featureKebab}.service.ts`),
    //   domainServiceTs(featureData),
    // );
    // // index.ts in domain
    // await appendToIndex(path.join(root, 'domain', 'index.ts'), [
    //   `export * from './${featureKebab}/${featureKebab}.entity';`,
    //   `export * from './${featureKebab}/${featureKebab}.service';`,
    // ]);

    // /********** 2. Infrastructure Layer **********/
    // // Schemas
    // await fs.ensureDir(paths.infraSchemaDir);
    // await fs.writeFile(
    //   path.join(paths.infraSchemaDir, `${featureKebab}.schema.ts`),
    //   infraSchemaTs(featureData),
    // );
    // await appendToIndex(path.join(paths.infraSchemaDir, 'index.ts'), [
    //   `export * from './${featureKebab}.schema';`,
    // ]);
    // // Repositories
    // await fs.ensureDir(paths.infraRepoDir);
    // await fs.writeFile(
    //   path.join(paths.infraRepoDir, `${featureKebab}.repository.ts`),
    //   infraRepositoryTs(featureData),
    // );
    // await appendToIndex(path.join(paths.infraRepoDir, 'index.ts'), [
    //   `export * from './${featureKebab}.repository';`,
    // ]);

    // /********** 3. Application Layer **********/
    // // Use-cases
    // await fs.ensureDir(paths.appUseCasesDir);
    // const actions = ['create', 'get', 'update', 'delete'];
    // const ucExports = actions.map(
    //   (a) => `export * from './${a}-${featureKebab}.use-case';`,
    // );
    // await fs.writeFile(
    //   path.join(paths.appUseCasesDir, `index.ts`),
    //   ucExports.join('\n') + '\n',
    // );
    // for (const action of actions) {
    //   await fs.writeFile(
    //     path.join(
    //       paths.appUseCasesDir,
    //       `${action}-${featureKebab}.use-case.ts`,
    //     ),
    //     ucUseCaseTs(action, featureData),
    //   );
    // }
    // // Module
    // await fs.writeFile(
    //   path.join(paths.appModuleDir, `${featureKebab}.module.ts`),
    //   applicationModuleTs(featureData),
    // );

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
async function updateGraphqlModule(
  moduleFile,
  Feature,
  feature,
  moduleClass,
  resolverClass,
) {
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

/*********DOMAIN LAYER******** */

/*-- domain/__name__/repositories/__name__.repository.abstract.ts--- */
function domainARepositoryTs({
  Feature,
  feature,
  featureKebab,
  moduleClass,
  resolverClass,
}) {
  return `import { AMongooseBaseRepository } from '@infrastructure/mongoose';
import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';

export abstract class A${Feature}Repository extends AMongooseBaseRepository<${Feature}Schema> {}`;
}

/*-- domain/__name__/repositories/__name__.repository.abstract.ts--- */
function domainServiceTs({
  Feature,
  feature,
  featureKebab,
  moduleClass,
  resolverClass,
}) {
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
function domainValueObjectTs({
  Feature,
  feature,
  featureKebab,
  moduleClass,
  resolverClass,
}) {
  return `import { ${Feature}Schema } from '@infrastructure/mongoose/schemas';
import { ABaseValueObject } from '@shared/value-objects';

export class ${Feature}ValueObject extends ABaseValueObject<${Feature}Schema> {
  protected override validate(_value: ${Feature}Schema): void {}
}`;
}
/*-- domain/__name__/__name__.module.ts --- */
function domainModuleTs({
  Feature,
  feature,
  featureKebab,
  moduleClass,
  resolverClass,
}) {
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

function infraSchemaTs({
  Feature,
  feature,
  featureKebab,
  moduleClass,
  resolverClass,
}) {
  return `import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ${Feature} extends Document {
  @Prop({ required: true })
  exampleField: string;
}

export const ${Feature}Schema = SchemaFactory.createForClass(${Feature});
`;
}

function infraRepositoryTs({
  Feature,
  feature,
  featureKebab,
  moduleClass,
  resolverClass,
}) {
  return `import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { ${Feature} } from '../schemas/${featureKebab}.schema';

@Injectable()
export class ${Feature}Repository {
  constructor(
    @Inject('${constantCase(Feature)}_MODEL') private readonly model: Model<${Feature}>,
  ) {}

  // create, find, update, remove methods
}
`;
}

function ucUseCaseTs(
  action,
  { Feature, feature, featureKebab, moduleClass, resolverClass },
) {
  const Action = action.charAt(0).toUpperCase() + action.slice(1);
  return `import { Injectable } from '@nestjs/common';
import { ${Feature}Service } from '../../domain/${featureKebab}/${featureKebab}.service';

@Injectable()
export class ${Action}${Feature}UseCase {
  constructor(private readonly service: ${Feature}Service) {}

  async execute(dto: any) {
    // TODO: ${action} logic
  }
}
`;
}

function applicationModuleTs({
  Feature,
  feature,
  featureKebab,
  moduleClass,
  resolverClass,
}) {
  return `import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ${Feature}Service } from '../../domain/${featureKebab}/${featureKebab}.service';
import { ${Feature}Repository } from '../../infrastructure/mongoose/repositories/${featureKebab}.repository';
import { ${Feature}, ${Feature}Schema } from '../../infrastructure/mongoose/schemas/${featureKebab}.schema';
import { Create${Feature}UseCase } from './use-cases/create-${featureKebab}.use-case';
import { Get${Feature}UseCase } from './use-cases/get-${featureKebab}.use-case';
import { Update${Feature}UseCase } from './use-cases/update-${featureKebab}.use-case';
import { Delete${Feature}UseCase } from './use-cases/delete-${featureKebab}.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ${Feature}.name, schema: ${Feature}Schema }]),
  ],
  providers: [
    ${Feature}Service,
    ${Feature}Repository,
    Create${Feature}UseCase,
    Get${Feature}UseCase,
    Update${Feature}UseCase,
    Delete${Feature}UseCase,
  ],
  exports: [${Feature}Service],
})
export class ${Feature}Module {}
`;
}

function gqlInputTs(
  prefix,
  { Feature, feature, featureKebab, moduleClass, resolverClass },
) {
  return `import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ${prefix}${Feature}Input {
  @Field()
  exampleField: string;
}
`;
}

function gqlObjectTs({
  Feature,
  feature,
  featureKebab,
  moduleClass,
  resolverClass,
}) {
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

function gqlResolverTs({
  Feature,
  feature,
  featureKebab,
  moduleClass,
  resolverClass,
}) {
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
