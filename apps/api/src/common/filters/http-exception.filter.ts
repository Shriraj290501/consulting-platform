import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorCode =
      exception instanceof HttpException
        ? this.extractErrorCode(exception)
        : 'INTERNAL_SERVER_ERROR';

    this.logger.error(
      `${request.method} ${request.url} — ${status} — ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      error: {
        code: errorCode,
        message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1',
      },
    });
  }

  private extractErrorCode(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'object' && response !== null && 'error' in response) {
      const errorResponse = response as Record<string, unknown>;
      if (typeof errorResponse['error'] === 'string') {
        return errorResponse['error'].toUpperCase().replace(/\s+/g, '_');
      }
    }
    return HttpStatus[exception.getStatus()] ?? 'UNKNOWN_ERROR';
  }
}
