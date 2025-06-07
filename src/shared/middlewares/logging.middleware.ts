import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as util from 'util';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    if (originalUrl.startsWith('/graphql')) {
      // Skip logging for GraphQL requests
      return next();
    }

    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Clone request body for logging
    let requestBody: any;
    try {
      requestBody = JSON.parse(JSON.stringify(req.body));
    } catch {
      requestBody = req.body;
    }

    this.logger.log(
      `[${requestId}] REQUEST: ${method} ${originalUrl} from IP ${ip}`,
    );

    // Intercept response body
    const oldSend = res.send;
    let responseBody: any;
    // @ts-ignore
    res.send = (body?: any) => {
      responseBody = body;
      // @ts-ignore
      return oldSend.call(res, body);
    };

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const status = res.statusCode;
      let respLogBody: any;
      try {
        respLogBody = JSON.parse(responseBody);
      } catch {
        respLogBody = responseBody;
      }
      this.logger.log(
        `[${requestId}] RESPONSE: ${method} ${originalUrl} - Status: ${status} - Duration: ${duration}ms`,
      );
    });

    next();
  }

  private generateRequestId() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const second = currentDate.getSeconds().toString().padStart(2, '0');
    const millisecond = currentDate
      .getMilliseconds()
      .toString()
      .padStart(3, '0');
    const randomDigits = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    const requestId = `REST-${year}${month}${day}-${second}${millisecond}-${randomDigits}`;
    return requestId;
  }
}
