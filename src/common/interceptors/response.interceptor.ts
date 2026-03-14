import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { RESPONSE_MESSAGE_KEY } from '@/common/decorators/response-message.decorator';

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<BaseResponse<T>> {
    const customMessage = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<Request>();
    const message = customMessage ?? this.defaultMessage(request.method);

    return next.handle().pipe(
      map((data) => ({
        success: true,
        message,
        data: data ?? null,
      })),
    );
  }

  private defaultMessage(method: string): string {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'Data berhasil dibuat';
      case 'PATCH':
      case 'PUT':
        return 'Data berhasil diperbarui';
      case 'DELETE':
        return 'Data berhasil dihapus';
      default:
        return 'Data berhasil diambil';
    }
  }
}
