import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const exRes = exceptionResponse as Record<string, unknown>;
        // Services throw { error: { code, message } } — extract nested message
        if (typeof exRes['error'] === 'object' && exRes['error'] !== null) {
          const errObj = exRes['error'] as Record<string, unknown>;
          message = (errObj['message'] as string) ?? message;
        } else if (Array.isArray(exRes['message'])) {
          // class-validator returns { message: string[] }
          message = (exRes['message'] as string[]).join('; ');
        } else if (typeof exRes['message'] === 'string') {
          message = exRes['message'];
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = exception.message;
    }

    this.logger.warn(`[${request.method}] ${request.url} → ${status}`);

    response.status(status).json({
      success: false,
      message,
      data: null,
    });
  }
}
