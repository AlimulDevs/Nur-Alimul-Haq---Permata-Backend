import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

function buildHostMock(method = 'GET', url = '/test') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const getResponse = jest.fn().mockReturnValue({ status });
  const getRequest = jest.fn().mockReturnValue({ method, url });

  return {
    switchToHttp: () => ({ getResponse, getRequest }),
    json,
    status,
  };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('should handle HttpException with a string response', () => {
    const exception = new HttpException('Simple message', HttpStatus.BAD_REQUEST);
    const host = buildHostMock();

    filter.catch(exception, host as any);

    expect(host.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Simple message' }),
    );
  });

  it('should extract nested error message from { error: { code, message } } format', () => {
    const exception = new HttpException(
      { error: { code: 'NOT_FOUND', message: 'Resource not found' } },
      HttpStatus.NOT_FOUND,
    );
    const host = buildHostMock();

    filter.catch(exception, host as any);

    expect(host.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Resource not found' }),
    );
  });

  it('should join class-validator array messages', () => {
    const exception = new HttpException(
      { message: ['email must be valid', 'password is required'] },
      HttpStatus.BAD_REQUEST,
    );
    const host = buildHostMock();

    filter.catch(exception, host as any);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'email must be valid; password is required',
      }),
    );
  });

  it('should handle HttpException with plain message string in response object', () => {
    const exception = new HttpException(
      { message: 'plain string message' },
      HttpStatus.FORBIDDEN,
    );
    const host = buildHostMock();

    filter.catch(exception, host as any);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'plain string message' }),
    );
  });

  it('should handle non-HTTP errors and return 500', () => {
    const exception = new Error('Something exploded');
    const host = buildHostMock();

    filter.catch(exception, host as any);

    expect(host.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('should return data: null in all error responses', () => {
    const exception = new HttpException('Oops', HttpStatus.BAD_REQUEST);
    const host = buildHostMock();

    filter.catch(exception, host as any);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: null }),
    );
  });
});
