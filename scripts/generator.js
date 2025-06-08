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

const prettier = require('prettier');
const path = require('path');
const fs = require('fs-extra');
const { pascalCase, camelCase, kebabCase } = require('change-case');
const { Project, SyntaxKind, QuoteKind } = require('ts-morph');
const { createPromptModule } = require('inquirer');
const prompt = createPromptModule();

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
  // 1) Hỏi loại generator
  const typeAnswer = await prompt([
    {
      type: 'list',
      name: 'generatorType',
      message: 'Chọn loại generator:',
      choices: [
        { name: 'Feature (DDD layers)', value: 'feature' },
        { name: 'Event (Publisher + Listener)', value: 'event' },
      ],
    },
  ]);

  if (typeAnswer.generatorType === 'feature') {
    await generateFeature();
  } else if (typeAnswer.generatorType === 'event') {
    await generateEvent();
  }
}

async function generateFeature() {
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
  // 2) Ask API types
  const { apiTypes } = await prompt([
    {
      type: 'checkbox',
      name: 'apiTypes',
      message: 'Chọn loại API scaffold:',
      choices: ['GraphQL', 'REST'],
      validate: (arr) => (arr.length > 0 ? true : 'Phải chọn ít nhất 1'),
    },
  ]);
  let restVersion = null;
  if (apiTypes.includes('REST')) {
    const ans = await prompt([
      {
        type: 'input',
        name: 'restVersion',
        message: 'Nhập version REST (ví dụ: 1):',
        default: '1',
        validate: (val) => {
          if (!val) {
            return 'Phiên bản REST không được để trống';
          }
          const num = Number(val.trim());
          if (isNaN(num) || num <= 0) {
            return 'Phiên bản REST phải là một số dương';
          }
          return true;
        },
      },
    ]);
    restVersion = Number(ans.restVersion.trim());
  }

  // Normalize tên
  const Feature = pascalCase(inputName); // Ví dụ: WalletTransaction
  const feature = camelCase(inputName); // Ví dụ: walletTransaction
  const featureKebab = kebabCase(inputName); // Ví dụ: wallet-transaction
  const Version = restVersion ? `V${restVersion}` : '';
  const version = restVersion ? `v${restVersion}` : '';

  const featureData = {
    Feature,
    feature,
    featureKebab,
    Version,
    version,
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
    fileCreateUseCase: `create-${featureKebab}.use-case`,
    fileFetchUseCase: `fetch-${featureKebab}.use-case`,
    fileGetOneUseCase: `get-one-${featureKebab}-by-condition.use-case`,
    fileUpdateOneUseCase: `update-one-${featureKebab}-by-condition.use-case`,
    fileDeleteOneUseCase: `delete-one-${featureKebab}-by-condition.use-case`,
    // Rest API files
    fileApiVersionModule: `api.module`,
    fileApiVersionModule: `api-${version}.module`,
    fileController: `${featureKebab}-${version}.controller`,
    fileCreateInputSchema: `create-${featureKebab}.input-schema`,
    fileUpdateInputSchema: `update-${featureKebab}.input-schema`,
    fileObjectSchema: `${featureKebab}.object-schema`,
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
    /*** Presentation REST Layer ***/
    presentationApiDir: path.join(root, 'presentation', 'api'),
    presentationApiVersionDir: path.join(
      root,
      'presentation',
      'api',
      `${version}`,
    ),
    presentationApiVersionControllersDir: path.join(
      root,
      'presentation',
      'api',
      `${version}`,
      'controllers',
    ),
    presentationApiVersionInputSchemasDir: path.join(
      root,
      'presentation',
      'api',
      `${version}`,
      'input-schemas',
    ),
    presentationApiVersionInputSchemaDir: path.join(
      root,
      'presentation',
      'api',
      `${version}`,
      'input-schemas',
      featureKebab,
    ),
    presentationApiVersionObjectSchemasDir: path.join(
      root,
      'presentation',
      'api',
      `${version}`,
      'object-schemas',
    ),
    presentationApiVersionObjectSchemaDir: path.join(
      root,
      'presentation',
      'api',
      `${version}`,
      'object-schemas',
      featureKebab,
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
  if (apiTypes.includes('GraphQL')) {
    console.log(`🚀 Bắt đầu scaffold cho feature: ${Feature} GraphQL`);
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
  }
  if (apiTypes.includes('REST')) {
    console.log(
      `🚀 Bắt đầu scaffold cho feature: ${Feature} với API types: ${apiTypes.join(', ')}${
        restVersion ? `, REST version: ${restVersion}` : ''
      }`,
    );

    // ---- input-schemas/<feature>/create-<feature>.input-schema.ts & update-<feature>.input-schema.ts ---
    await fs.ensureDir(paths.presentationApiVersionInputSchemaDir);
    writeNewFile(
      path.join(
        paths.presentationApiVersionInputSchemaDir,
        `create-${featureKebab}.input-schema.ts`,
      ),
      restApiInputSchemaTs('Create', featureData),
    );
    writeNewFile(
      path.join(
        paths.presentationApiVersionInputSchemaDir,
        `update-${featureKebab}.input-schema.ts`,
      ),
      restApiInputSchemaTs('Update', featureData),
    );
    writeNewFile(
      path.join(
        paths.presentationApiVersionInputSchemaDir,
        `${files.index}.ts`,
      ),
      writeIndexTs([
        `create-${featureKebab}.input-schema`,
        `update-${featureKebab}.input-schema`,
      ]),
    );
    await appendToIndex(
      path.join(
        paths.presentationApiVersionInputSchemasDir,
        `${files.index}.ts`,
      ),
      [`export * from './${featureKebab}';`],
    );

    // ---- object-schemas/<feature>.object-schema.ts ---
    await fs.ensureDir(paths.presentationApiVersionObjectSchemaDir);
    writeNewFile(
      path.join(
        paths.presentationApiVersionObjectSchemaDir,
        `${featureKebab}.object-schema.ts`,
      ),
      restApiObjectSchemaTs(featureData),
    );
    writeNewFile(
      path.join(
        paths.presentationApiVersionObjectSchemaDir,
        `${files.index}.ts`,
      ),
      writeIndexTs([`${featureKebab}.object-schema`]),
    );
    await appendToIndex(
      path.join(
        paths.presentationApiVersionObjectSchemasDir,
        `${files.index}.ts`,
      ),
      [`export * from './${featureKebab}';`],
    );

    // ---- controllers/<feature>.controller.ts ---
    await fs.ensureDir(paths.presentationApiVersionControllersDir);
    writeNewFile(
      path.join(
        paths.presentationApiVersionControllersDir,
        `${featureKebab}-${version}.controller.ts`,
      ),
      restApiControllerTs(featureData),
    );
    await appendToIndex(
      path.join(paths.presentationApiVersionControllersDir, 'index.ts'),
      [`export * from './${featureKebab}-${version}.controller';`],
    );

    /********** 5. Update GraphqlModule **********/
    const apiVersionModulePath = path.join(
      paths.presentationApiVersionDir,
      `api-${version}.module.ts`,
    );
    await updateApiVersionModule(apiVersionModulePath, featureData);
  }
  console.log(`✅ Scaffold cho ${Feature} đã được tạo thành công.`);
}

async function generateEvent() {
  // 2) Hỏi tên Event và Key
  const eventAnswers = await prompt([
    {
      type: 'input',
      name: 'eventName',
      message: 'Nhập tên Event (ví dụ: PostCreated):',
      validate: (val) => {
        if (!val || val.trim().length === 0) {
          return 'Tên Event không được để trống';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'eventKey',
      message: 'Nhập Event Key (ví dụ: post.created):',
      validate: (val) => {
        if (!val || val.trim().length === 0) {
          return 'Event Key không được để trống';
        }
        return true;
      },
    },
  ]);
  const eventName = eventAnswers.eventName.trim();
  const eventKey = eventAnswers.eventKey.trim();

  // Generate event files
  const EventPascal = pascalCase(eventName);
  const eventKebab = kebabCase(eventName);
  const root = path.resolve(__dirname, '../src');
  const files = {
    index: `index`,
    eventModule: `event.module`,
    eventKey: 'event-key',
    eventMap: 'event-map',
    eventPublisher: `${eventKebab}.event-publisher`,
    eventListener: `${eventKebab}.event-listener`,
  };
  const paths = {
    eventDir: path.join(root, 'events'),
    eventPublishersDir: path.join(root, 'events', 'publishers'),
    eventListenersDir: path.join(root, 'events', 'listeners'),
    eventSharesDir: path.join(root, 'events', 'shares'),
  };

  // const eventConstant = constantCase(eventKey.replace(/\./g, '_'));

  console.log(`🚀 Generating Event: ${EventPascal} with key: ${eventKey} `);
  await updateEventKey({ EventPascal, eventKey });

  await fs.ensureDir(paths.eventPublishersDir);
  writeNewFile(
    path.join(paths.eventPublishersDir, `${files.eventPublisher}.ts`),
    eventPublisherTs({ EventPascal, eventKey }),
  );
  await appendToIndex(
    path.join(paths.eventPublishersDir, `${files.index}.ts`),
    [`export * from './${files.eventPublisher}';`],
  );

  await fs.ensureDir(paths.eventListenersDir);
  writeNewFile(
    path.join(paths.eventListenersDir, `${files.eventListener}.ts`),
    eventListenerTs({ EventPascal, eventKey }),
  );
  await appendToIndex(path.join(paths.eventListenersDir, `${files.index}.ts`), [
    `export * from './${files.eventListener}';`,
  ]);
  await updateEventMap({ EventPascal, eventKey });
  await addListenerToEventModule({ EventPascal, eventKey });

  console.log(`✅ Event ${EventPascal} generated successfully!`);
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

async function writeNewFile(filePath, data) {
  if (await fs.pathExists(filePath)) {
    console.log(`⚠️  Skipped, already exists: ${filePath}`);
    return;
  }
  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, data);
  console.log(`✔️  Created ${filePath}`);
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

/********* PRESENTATION LAYER (REST API) *********/
function restApiInputSchemaTs(prefix, { Feature, feature, featureKebab }) {
  return `import { MongooseBaseObjectSchema } from '@infrastructure/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class ${prefix}${Feature}InputSchema extends MongooseBaseObjectSchema {
  @ApiProperty({
    description: 'Name of ${Feature}',
    example: 'Name',
  })
  name!: string;
}
`;
}
function restApiObjectSchemaTs({ Feature, feature, featureKebab }) {
  return `import { MongooseBaseObjectSchema } from '@infrastructure/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class ${Feature}ObjectSchema extends MongooseBaseObjectSchema {
  @ApiProperty({
    description: 'Name of ${Feature}',
    example: 'Name',
  })
  name!: string;
}`;
}

function restApiControllerTs({
  Feature,
  feature,
  featureKebab,
  version,
  Version,
}) {
  return `import {
  Fetch${Feature}UseCase,
  GetOne${Feature}ByConditionUseCase,
  Create${Feature}UseCase,
  UpdateOne${Feature}ByConditionUseCase,
  DeleteOne${Feature}ByConditionUseCase,
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
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  ApiResponsePaginationObjectSchema,
  ApiResponseObjectSchema,
  ApiAuthRequired,
} from '@shared/decorators/swagger';
import {
  QueryGetListInputSchema,
  Create${Feature}InputSchema,
  Update${Feature}InputSchema,
} from '../input-schemas';
import { ${Feature}ObjectSchema } from '../object-schemas';

@ApiTags('${Feature} ${Version}')
@Controller('api/${version}/${featureKebab}')
export class ${Feature}${Version}Controller {
  constructor(
    private readonly fetch${Feature}UseCase: Fetch${Feature}UseCase,
    private readonly getOne${Feature}ByConditionUseCase: GetOne${Feature}ByConditionUseCase,
    private readonly create${Feature}UseCase: Create${Feature}UseCase,
    private readonly updateOne${Feature}ByConditionUseCase: UpdateOne${Feature}ByConditionUseCase,
    private readonly deleteOne${Feature}ByConditionUseCase: DeleteOne${Feature}ByConditionUseCase,
  ) {}

  @Get()
  @ApiAuthRequired()
  @ApiOperation({ summary: 'Get All ${Feature}' })
  @ApiResponsePaginationObjectSchema(${Feature}ObjectSchema)
  async getAll${Feature}(@Query() queryGetListInput: QueryGetListInputSchema) {
    console.log('queryGetListInput', queryGetListInput);
    return await this.fetch${Feature}UseCase.execute(queryGetListInput);
  }

  @Get(':_id')
  @ApiOperation({ summary: 'Get One ${Feature}' })
  @ApiResponseObjectSchema(${Feature}ObjectSchema)
  async getOne${Feature}ById(@Param('_id') _id: string) {
    return this.getOne${Feature}ByConditionUseCase.execute({ _id });
  }

  @Post()
  @ApiOperation({ summary: 'Create One ${Feature}' })
  @ApiResponseObjectSchema(${Feature}ObjectSchema)
  async create${Feature}(@Body() data: Create${Feature}InputSchema) {
    return this.create${Feature}UseCase.execute(data);
  }

  @Patch(':_id')
  @ApiOperation({ summary: 'Update One ${Feature}' })
  @ApiBody({ type: Update${Feature}InputSchema })
  @ApiResponseObjectSchema(${Feature}ObjectSchema)
  async updateOne${Feature}ById(
    @Param('_id') _id: string,
    @Body() data: Update${Feature}InputSchema,
  ) {
    return this.updateOne${Feature}ByConditionUseCase.execute({ _id }, data);
  }

  @Delete(':_id')
  @ApiOperation({ summary: 'Delete One ${Feature}' })
  @ApiResponseObjectSchema(${Feature}ObjectSchema)
  async deleteOne${Feature}ById(@Param('_id') _id: string) {
    return this.deleteOne${Feature}ByConditionUseCase.execute({ _id });
  }
}`;
}
async function updateApiVersionModule(
  pathFile,
  { Feature, featureKebab, Version },
) {
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
  });
  const sourceFile = project.getSourceFileOrThrow(pathFile);

  const controllerName = `${Feature}${Version}Controller`;
  const appModuleName = `Application${Feature}Module`;

  // --- Import controller from ./controllers/<feature>.controller.ts ---
  let ctrlImport = sourceFile.getImportDeclaration((d) =>
    d.getModuleSpecifierValue().startsWith('./controllers'),
  );
  if (ctrlImport) {
    const names = ctrlImport.getNamedImports().map((n) => n.getName());
    if (!names.includes(controllerName)) {
      ctrlImport.addNamedImport(controllerName);
    }
  } else {
    sourceFile.addImportDeclaration({
      namedImports: [controllerName],
      moduleSpecifier: `./controllers/${featureKebab}.controller`,
      quoteKind: QuoteKind.Single,
    });
  }

  // --- Import application module from '@application' ---
  let appImport = sourceFile.getImportDeclaration(
    (d) => d.getModuleSpecifierValue() === '@application',
  );
  if (appImport) {
    const names = appImport.getNamedImports().map((n) => n.getName());
    if (!names.includes(appModuleName)) {
      appImport.addNamedImport(appModuleName);
    }
  } else {
    sourceFile.addImportDeclaration({
      namedImports: [appModuleName],
      moduleSpecifier: '@application',
      quoteKind: QuoteKind.Single,
    });
  }

  // --- Update @Module decorator ---
  const classDecl = sourceFile
    .getClasses()
    .find((c) => c.getName()?.endsWith('Module'));
  if (!classDecl) {
    throw new Error('No Module class found in ' + pathFile);
  }
  const modDec = classDecl.getDecoratorOrThrow('Module');
  const objLit = modDec
    .getArguments()[0]
    .asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

  // controllers array
  const controllersProp = objLit.getProperty('controllers');
  if (!controllersProp) {
    objLit.addPropertyAssignment({
      name: 'controllers',
      initializer: `[${controllerName}]`,
    });
  } else {
    const arr = controllersProp.getInitializerIfKindOrThrow(
      SyntaxKind.ArrayLiteralExpression,
    );
    if (!arr.getElements().some((e) => e.getText() === controllerName)) {
      arr.addElement(controllerName);
    }
  }

  // imports array
  const importsProp = objLit.getProperty('imports');
  if (!importsProp) {
    objLit.addPropertyAssignment({
      name: 'imports',
      initializer: `[${appModuleName}]`,
    });
  } else {
    const arr = importsProp.getInitializerIfKindOrThrow(
      SyntaxKind.ArrayLiteralExpression,
    );
    if (!arr.getElements().some((e) => e.getText() === appModuleName)) {
      arr.addElement(appModuleName);
    }
  }

  // Save and format
  sourceFile.saveSync();
  console.log(
    `✅ Đã thêm ${controllerName} & ${appModuleName} vào ${pathFile}`,
  );
  await formatWithPrettierSync(pathFile);
}

//===============
async function createEventKeyConstant(eventKey, eventConstant) {
  const eventKeysPath = path.join(
    process.cwd(),
    'src',
    'shared',
    'constants',
    'event-keys.ts',
  );

  // Ensure directory exists
  await fs.ensureDir(path.dirname(eventKeysPath));

  let content = '';
  if (await fs.pathExists(eventKeysPath)) {
    content = await fs.readFile(eventKeysPath, 'utf-8');
  } else {
    content = `export const EventKey = {\n} as const;\n`;
  }

  // Add new event key if not exists
  const keyLine = `  ${eventConstant}: '${eventKey}',`;
  if (!content.includes(eventConstant)) {
    content = content.replace('} as const;', `  ${keyLine}\n} as const;`);
    await fs.writeFile(eventKeysPath, content, 'utf-8');
    await formatWithPrettierSync(eventKeysPath);
  }
}
function eventPublisherTs({ EventPascal, eventKey, eventKebab }) {
  return `export class ${EventPascal}EventPublisher {
    input?: unknown;
    constructor(data: ${EventPascal}EventPublisher) {
      Object.assign(this, data);
    }
  }`;
}

function eventListenerTs({ EventPascal, eventKey }) {
  return `import { ${EventPascal}EventPublisher } from '@events/publishers';
import { EVENT_KEY } from '@events/shares';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
@Injectable()
export class ${EventPascal}EventListener {
  private readonly logger = new Logger(${EventPascal}EventListener.name);
  @OnEvent(EventKey.${toConstantCase(eventKey.replace(/\./g, '_'))}, { async: true })
  handle${EventPascal}(data: ${EventPascal}EventPublisher) {
    this.logger.log('Data Emitter:', data);
  }
}`;
}
async function updateEventKey({ eventKey }) {
  const eventKeyPath = path.join(
    process.cwd(),
    'src',
    'events',
    'shares',
    'event-key.ts',
  );

  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(eventKeyPath);

  // 1. Lấy declaration của EVENT_KEY
  const eventKeyVar = sourceFile.getVariableDeclaration('EVENT_KEY');
  if (!eventKeyVar) {
    throw new Error('❌ Cannot find variable declaration EVENT_KEY');
  }

  // 2. Lấy initializer và nếu là "as const" thì unwrap
  let init = eventKeyVar.getInitializer();
  if (!init) {
    throw new Error('❌ EVENT_KEY has no initializer');
  }
  // Nếu là AsExpression (tức object ... as const), thì lấy bên trong
  if (init.getKind() === SyntaxKind.AsExpression) {
    init = init.getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  }

  if (init.getKind() !== SyntaxKind.ObjectLiteralExpression) {
    throw new Error('❌ EVENT_KEY initializer is not an object literal');
  }
  let currentObj = init;

  // 3. Tách và lặp từng phần của key
  const parts = eventKey.split('.');
  for (let i = 0; i < parts.length; i++) {
    const raw = parts[i];
    const isLast = i === parts.length - 1;
    const keyName = toConstantCase(raw);

    // 4. Tìm property tại level này
    let prop = currentObj.getProperty(keyName);

    if (!prop) {
      if (isLast) {
        // Level cuối: thêm giá trị string
        currentObj.addPropertyAssignment({
          name: keyName,
          initializer: `'${eventKey}'`,
        });
        break;
      } else {
        // Level giữa: tạo object rỗng
        prop = currentObj.addPropertyAssignment({
          name: keyName,
          initializer: `{}`,
        });
      }
    }

    // 5. Drill xuống nested nếu chưa phải cuối
    if (!isLast) {
      let nested = prop.getInitializer();
      if (!nested || nested.getKind() !== SyntaxKind.ObjectLiteralExpression) {
        prop.setInitializer('{}');
        nested = prop.getInitializer();
      }
      currentObj = nested;
    }
  }

  // 6. Lưu & format
  await sourceFile.save();
  await formatWithPrettierSync(eventKeyPath);
  console.log(`✅ EVENT_KEY updated: ${eventKey}`);
}

async function updateEventMap({ eventKey, EventPascal }) {
  const eventMapPath = path.join(
    process.cwd(),
    'src',
    'events',
    'shares',
    'event-map.ts',
  );

  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(eventMapPath);

  // 1. Thêm import publisher
  const publisherName = `${EventPascal}EventPublisher`;
  const existingImports = sourceFile.getImportDeclaration('@events/publishers');

  if (existingImports) {
    const namedImports = existingImports.getNamedImports();
    const hasImport = namedImports.some(
      (imp) => imp.getName() === publisherName,
    );

    if (!hasImport) {
      existingImports.addNamedImport(publisherName);
    }
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@events/publishers',
      namedImports: [publisherName],
    });
  }

  // 2. Thêm vào EventMap interface
  const eventMapInterface = sourceFile.getInterface('EventMap');
  if (!eventMapInterface) {
    console.error('❌ Cannot find EventMap interface');
    return;
  }

  // Tạo event key constant path
  const parts = eventKey.split('.');
  const constantPath = `EVENT_KEY.${parts[0].toUpperCase()}.${parts[1].toUpperCase()}`;

  // Kiểm tra xem property đã tồn tại chưa
  const existingProperty = eventMapInterface.getProperty(`[${constantPath}]`);
  if (!existingProperty) {
    eventMapInterface.addProperty({
      name: `[${constantPath}]`,
      type: publisherName,
    });
  }

  // Save và format
  await sourceFile.save();
  await formatWithPrettierSync(eventMapPath);
  console.log(`✅ Updated EventMap with ${constantPath} -> ${publisherName}`);
}
function toConstantCase(str) {
  return (
    str
      // chèn dấu gạch dưới trước chữ in hoa, ví dụ "createdOne" → "created_One"
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      // đổi toàn bộ sang uppercase
      .toUpperCase()
  );
}

async function addListenerToEventModule({ EventPascal }) {
  // Tính tên class listener
  const listenerName = `${EventPascal}EventListener`;

  const modulePath = path.join(
    process.cwd(),
    'src',
    'events',
    'event.module.ts',
  );

  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(modulePath);

  // 1. Import từ './listeners'
  let importDecl = sourceFile.getImportDeclaration(
    (dec) => dec.getModuleSpecifierValue() === './listeners',
  );
  if (importDecl) {
    // nếu chưa có specifier này thì thêm
    const already = importDecl
      .getNamedImports()
      .some((ni) => ni.getName() === listenerName);
    if (!already) importDecl.addNamedImport(listenerName);
  } else {
    // chưa có import './listeners' hoàn toàn
    sourceFile.addImportDeclaration({
      moduleSpecifier: './listeners',
      namedImports: [listenerName],
    });
  }

  // 2. Lấy class EventModule và decorator @Module
  const eventModuleClass = sourceFile.getClass('EventModule');
  if (!eventModuleClass) throw new Error('Không tìm thấy class EventModule');
  const moduleDec = eventModuleClass.getDecorator('Module');
  if (!moduleDec) throw new Error('Không tìm thấy @Module trên EventModule');

  // 3. Lấy object literal args của @Module({...})
  const [arg] = moduleDec.getArguments();
  if (!arg || arg.getKind() !== SyntaxKind.ObjectLiteralExpression)
    throw new Error('@Module không có argument object');
  const moduleObj = arg;

  // 4. Tìm hoặc tạo property 'providers'
  let providersProp = moduleObj.getProperty('providers');
  if (!providersProp) {
    moduleObj.addPropertyAssignment({
      name: 'providers',
      initializer: '[]',
    });
    providersProp = moduleObj.getProperty('providers');
  }

  // 5. Lấy array literal và thêm listener nếu chưa có
  const arrLit = providersProp.getFirstChildByKindOrThrow(
    SyntaxKind.ArrayLiteralExpression,
  );
  const exists = arrLit
    .getElements()
    .some((el) => el.getText() === listenerName);
  if (!exists) {
    arrLit.addElement(listenerName);
  }

  // 6. Save & format
  await sourceFile.save();
  formatWithPrettierSync(modulePath);

  console.log(`✅ Đã thêm ${listenerName} vào providers của EventModule`);
}
