import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

function buildContext(method: string, customMessage?: string): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ method }),
    }),
  } as unknown as ExecutionContext;
}

function buildCallHandler(data: unknown): CallHandler {
  return { handle: () => of(data) };
}

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new ResponseInterceptor(reflector);
  });

  it('should wrap data with success: true and custom message', (done) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('Custom message');
    const context = buildContext('GET');
    const handler = buildCallHandler({ id: 1 });

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        message: 'Custom message',
        data: { id: 1 },
      });
      done();
    });
  });

  it('should use default GET message when no custom message', (done) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = buildContext('GET');
    const handler = buildCallHandler([]);

    interceptor.intercept(context, handler).subscribe((result) => {
      expect((result as any).message).toBe('Data berhasil diambil');
      done();
    });
  });

  it('should use default POST message', (done) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = buildContext('POST');
    const handler = buildCallHandler({ id: 2 });

    interceptor.intercept(context, handler).subscribe((result) => {
      expect((result as any).message).toBe('Data berhasil dibuat');
      done();
    });
  });

  it('should use default PATCH message', (done) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = buildContext('PATCH');
    const handler = buildCallHandler({});

    interceptor.intercept(context, handler).subscribe((result) => {
      expect((result as any).message).toBe('Data berhasil diperbarui');
      done();
    });
  });

  it('should use default DELETE message', (done) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = buildContext('DELETE');
    const handler = buildCallHandler(null);

    interceptor.intercept(context, handler).subscribe((result) => {
      expect((result as any).message).toBe('Data berhasil dihapus');
      done();
    });
  });

  it('should set data to null when handler returns null or undefined', (done) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('Done');
    const context = buildContext('DELETE');
    const handler = buildCallHandler(undefined);

    interceptor.intercept(context, handler).subscribe((result) => {
      expect((result as any).data).toBeNull();
      done();
    });
  });
});
