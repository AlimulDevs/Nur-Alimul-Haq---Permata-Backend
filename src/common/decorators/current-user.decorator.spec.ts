import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';

function getDecoratorFactory(decorator: (...args: any[]) => ParameterDecorator) {
  class TestController {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handler(@decorator() _value: any) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'handler');
  return args[Object.keys(args)[0]].factory;
}

describe('CurrentUser decorator', () => {
  it('should return request.user from the execution context', () => {
    const mockUser = { id: 'uuid-1', email: 'jane@example.com', role: 'customer' };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as unknown as ExecutionContext;

    const factory = getDecoratorFactory(CurrentUser);
    const result = factory(undefined, mockContext);

    expect(result).toEqual(mockUser);
  });

  it('should return undefined when no user is on the request', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const factory = getDecoratorFactory(CurrentUser);
    const result = factory(undefined, mockContext);

    expect(result).toBeUndefined();
  });
});
