import { Plugin } from '@nestjs/apollo';
import { Logger } from '@nestjs/common';
import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContext,
  GraphQLRequestContextWillSendResponse,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';

import _ from 'lodash';
import * as util from 'util';

@Plugin()
export class GraphqlLoggingPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(GraphqlLoggingPlugin.name);
  constructor() {}

  async requestDidStart(
    requestContext: GraphQLRequestContext,
  ): Promise<GraphQLRequestListener> {
    const thatLogger = this.logger;

    if (requestContext.request.operationName !== 'IntrospectionQuery') {
      const requestId = this.generateRequestId();
      _.set(requestContext.request, 'requestId', requestId);
      thatLogger.log(
        `[${requestId}] REQUEST:\n ${
          requestContext.request.query || 'undefined'
        }`,
      );
    }
    return {
      async willSendResponse(
        requestContextWillSendResponse: GraphQLRequestContextWillSendResponse<BaseContext>,
      ): Promise<void> {
        //requestContextWillSendResponse.queryHash;
        if (
          requestContextWillSendResponse.request.operationName !==
          'IntrospectionQuery'
        ) {
          const requestId = _.get(requestContext.request, 'requestId');
          if (!requestContextWillSendResponse.errors) {
            thatLogger.log(`[${requestId}] RESPONSE WITHOUT ANY ERRORS`);
          } else {
            const errors = requestContextWillSendResponse.errors.concat();
            const responseErrors =
              requestContextWillSendResponse.response.errors?.concat();
            if (errors && responseErrors) {
              for (let i = 0; i < errors.length; i++) {
                const result = {
                  ...responseErrors[i],
                  stack: errors[i]?.stack,
                };
                if (result.extensions) {
                  delete result.extensions['exception'];
                }
                if (
                  result.extensions &&
                  result.extensions['code'] !== 'INTERNAL_SERVER_ERROR'
                ) {
                  thatLogger.warn(
                    `[${requestId}] RESPONSE WITH ERRORS: ${util.inspect(
                      result,
                      {
                        depth: 4,
                      },
                    )}`,
                  );
                } else {
                  thatLogger.error(
                    `[${requestId}] RESPONSE WITH ERRORS: ${util.inspect(
                      result,
                      {
                        depth: 4,
                      },
                    )}`,
                  );
                }
              }
            }
          }
        }
      },
    };
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
    const requestId = `GQL-${year}${month}${day}-${second}${millisecond}-${randomDigits}`;
    return requestId;
  }
}
