import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

function buildHost({
  url = '/api/v1/todos',
  method = 'GET',
}: {
  url?: string;
  method?: string;
} = {}) {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const getResponse = vi.fn().mockReturnValue({ status });
  const getRequest = vi.fn().mockReturnValue({ url, method });

  return {
    switchToHttp: () => ({ getResponse, getRequest }),
    json,
    status,
  };
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let loggerErrorSpy: ReturnType<typeof vi.spyOn>;
  let loggerWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    filter = new GlobalExceptionFilter();
    loggerErrorSpy = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    loggerWarnSpy = vi
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });

  describe('known HttpException (4xx) errors', () => {
    it('should return 404 with NotFoundException details', () => {
      const host = buildHost({ method: 'GET', url: '/api/v1/todos/999' });
      const exception = new NotFoundException('Todo with id "999" not found');

      filter.catch(exception, host as never);

      expect(host.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(host.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Todo with id "999" not found',
          method: 'GET',
          path: '/api/v1/todos/999',
        }),
      );
    });

    it('should return 400 with BadRequestException details', () => {
      const host = buildHost({ method: 'POST', url: '/api/v1/todos' });
      const exception = new BadRequestException('Validation failed');

      filter.catch(exception, host as never);

      expect(host.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(host.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Validation failed',
        }),
      );
    });

    it('should handle array messages from ValidationPipe', () => {
      const host = buildHost({ method: 'POST', url: '/api/v1/todos' });
      const exception = new BadRequestException({
        message: ['title must be a string', 'title should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(exception, host as never);

      expect(host.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(host.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: ['title must be a string', 'title should not be empty'],
        }),
      );
    });

    it('should return 401 with UnauthorizedException details', () => {
      const host = buildHost({ method: 'GET', url: '/api/v1/todos' });
      const exception = new UnauthorizedException(
        'Invalid or expired authentication token',
      );

      filter.catch(exception, host as never);

      expect(host.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(host.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized',
          message: 'Invalid or expired authentication token',
        }),
      );
    });

    it('should handle HttpException with a plain string response', () => {
      const host = buildHost({ method: 'GET', url: '/api/v1/todos' });
      const exception = new HttpException(
        'Custom error message',
        HttpStatus.FORBIDDEN,
      );

      filter.catch(exception, host as never);

      expect(host.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(host.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Custom error message',
        }),
      );
    });

    it('should log known 4xx errors at WARN level, not ERROR', () => {
      const host = buildHost();
      const exception = new NotFoundException('Not found');

      filter.catch(exception, host as never);

      expect(loggerWarnSpy).toHaveBeenCalled();
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should include timestamp and path in the response', () => {
      const host = buildHost({ method: 'PATCH', url: '/api/v1/todos/1' });
      const exception = new NotFoundException('Todo not found');

      filter.catch(exception, host as never);

      const jsonArg = host.json.mock.calls[0][0];
      expect(jsonArg.timestamp).toBeDefined();
      expect(jsonArg.path).toBe('/api/v1/todos/1');
      expect(jsonArg.method).toBe('PATCH');
    });
  });

  describe('known HttpException (5xx) errors', () => {
    it('should log 5xx HttpExceptions at ERROR level', () => {
      const host = buildHost();
      const exception = new InternalServerErrorException(
        'Something went wrong',
      );

      filter.catch(exception, host as never);

      expect(loggerErrorSpy).toHaveBeenCalled();
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('should return 500 with InternalServerErrorException details', () => {
      const host = buildHost({ method: 'POST', url: '/api/v1/todos' });
      const exception = new InternalServerErrorException(
        'Something went wrong',
      );

      filter.catch(exception, host as never);

      expect(host.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(host.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    });
  });

  describe('unhandled non-HttpException errors', () => {
    it('should return 500 for an unexpected Error', () => {
      const host = buildHost({ method: 'GET', url: '/api/v1/todos' });
      const exception = new Error('Database connection failed');

      filter.catch(exception, host as never);

      expect(host.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(host.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'Internal Server Error',
        }),
      );
    });

    it('should log unhandled exceptions at ERROR level with request context', () => {
      const host = buildHost({ method: 'GET', url: '/api/v1/todos' });
      const exception = new Error('Unexpected failure');

      filter.catch(exception, host as never);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/v1/todos'),
        exception.stack,
      );
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('should return 500 for a non-Error exception', () => {
      const host = buildHost();

      filter.catch('something completely unexpected', host as never);

      expect(host.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(host.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        }),
      );
    });

    it('should not log unhandled exceptions at WARN level', () => {
      const host = buildHost();
      const exception = new Error('Unexpected failure');

      filter.catch(exception, host as never);

      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });
  });
});
