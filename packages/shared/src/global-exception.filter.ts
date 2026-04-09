import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };
        message = responseObj.message ?? message;
        error = responseObj.error ?? error;
      }

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `HTTP ${status} Error: ${message} - ${request.method} ${request.url}`,
          exception instanceof Error ? exception.stack : '',
        );
      } else {
        this.logger.warn(
          `HTTP ${status} Error: ${message} - ${request.method} ${request.url}`,
        );
      }
    } else {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${exception}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    };

    response.status(status).json(errorResponse);
  }
}
