import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { AppModule } from '@app.module';
import { configSwagger } from '@shared/configs/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true, // hoặc mảng origins cụ thể
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  // ================ [START] Swagger setup [START] ================

  const document = SwaggerModule.createDocument(app, configSwagger, {});

  SwaggerModule.setup('openapi', app, document, {
    swaggerOptions: {
      operationsSorter: function (a: any, b: any) {
        var order: any = {
          get: '0',
          post: '1',
          patch: '2',
          put: '3',
          delete: '4',
        };
        return order[a.get('method')].localeCompare(order[b.get('method')]);
      },
      apisSorter: 'alpha',
    },
  });

  const yamlString = yaml.dump(document, { skipInvalid: true });

  try {
    fs.writeFileSync('./swagger.yml', yamlString, 'utf8');
    console.log('Swagger documentation exported to swagger.yaml');
  } catch (err) {
    console.error('Error exporting Swagger documentation:', err);
  }
  // ================ [END] Swagger setup [END] ================

  const configService = app.get<ConfigService>(ConfigService);

  await app.listen(+configService.get('server.port'));

  Logger.log(`http://localhost:${configService.get('server.port')}/openapi`);
  Logger.log(`http://localhost:${configService.get('server.port')}/graphql`);
}
bootstrap();
