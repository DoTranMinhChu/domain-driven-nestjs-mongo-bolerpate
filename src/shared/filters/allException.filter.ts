import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ContextType,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { BaseException } from '@shared/exceptions/base.exception';
import { IException } from '@shared/exceptions/exception.interface';
import { ApolloError } from 'apollo-server-express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(ex: unknown | any, host: ArgumentsHost): void {
    let exception = null;

    try {
      exception = new ex();
    } catch (e) {
      exception = ex;
    }
    this.logger.error(exception);
    console.error(exception);
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: IException & {
      statusCode?: HttpStatus;
      path?: any;
      type?: string;
      message?: string;
    } = {
      statusCode,
      message: exception?.message,
      type: exception?.name || '',
    };
    if (exception instanceof HttpException) {
      responseBody.statusCode = exception.getStatus();
      if (exception.getResponse()) {
        const message = exception.getResponse();
        responseBody.type = exception.name;
        if (typeof message == 'object') {
          responseBody = Object.assign(responseBody, message);
        } else {
          responseBody.message = message;
        }
      }
    }
    if (exception instanceof BaseException) {
      responseBody = Object.assign(responseBody, exception.options);
    }
    switch (host.getType() as ContextType | 'graphql') {
      case 'graphql':
        throw new ApolloError(
          responseBody?.message!,
          responseBody?.statusCode.toString(),
          responseBody,
        );
      default:
        responseBody.path = httpAdapter.getRequestUrl(ctx.getRequest());
        return httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
        break;
    }
  }
}
