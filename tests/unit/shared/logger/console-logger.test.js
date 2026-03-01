import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../../../src/modules/shared/logger/console-logger.js';

describe('console logger', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.clearAllMocks();
  });

  it('deve não imprimir logs DEBUG em ambiente de teste (caso de borda)', () => {
    // Arrange
    process.env.NODE_ENV = 'test';

    // Act
    logger.debug('CustomerService', 'debug message');

    // Assert
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('deve imprimir logs INFO (fluxo feliz)', () => {
    // Arrange
    process.env.NODE_ENV = 'development';

    // Act
    logger.info('App', 'started');

    // Assert
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('deve imprimir logs com payload de dados (fluxo feliz)', () => {
    // Arrange
    process.env.NODE_ENV = 'development';

    // Act
    logger.warn('CustomerService', 'warning', { foo: 'bar' });

    // Assert
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('deve imprimir logs ERROR (caso de erro)', () => {
    // Arrange
    process.env.NODE_ENV = 'development';

    // Act
    logger.error('CustomerService', 'error');

    // Assert
    expect(logSpy).toHaveBeenCalledTimes(1);
  });
});
