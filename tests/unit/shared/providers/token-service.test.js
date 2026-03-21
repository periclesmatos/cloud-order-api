import { describe, expect, it } from 'vitest';
import { TokenService } from '../../../../src/modules/shared/providers/token-service.js';

describe('TokenService (unit)', () => {
  it('deve assinar e validar token com payload (fluxo feliz)', () => {
    const tokenService = new TokenService('unit-token-signer-v1');
    const token = tokenService.sign({ sub: 'user-1', type: 'USER' }, 3600);
    const payload = tokenService.verify(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.type).toBe('USER');
  });
});
