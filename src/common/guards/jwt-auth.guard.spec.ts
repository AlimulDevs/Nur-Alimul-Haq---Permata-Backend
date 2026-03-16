import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

function buildContext(isPublic: boolean | undefined, overrides?: object): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    ...overrides,
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for a public route', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const context = buildContext(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should call super.canActivate for a protected route', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      // Mock super.canActivate by spying on AuthGuard('jwt').prototype
      const superSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      const context = buildContext(false);
      const result = guard.canActivate(context);

      expect(superSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should return the user when no error and user exists', () => {
      const user = { id: 'uuid-1', email: 'jane@example.com', role: 'customer' };

      const result = guard.handleRequest(null, user);

      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when there is an error', () => {
      expect(() => guard.handleRequest(new Error('jwt error'), null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is falsy', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
