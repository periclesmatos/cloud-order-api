import { describe, expect, it } from 'vitest';
import { PasswordHasher } from '../../../../src/modules/shared/providers/password-hasher.js';

describe('PasswordHasher (unit)', () => {
  it('deve gerar hash diferente da senha em texto puro (fluxo feliz)', () => {
    const hasher = new PasswordHasher();
    const hash = hasher.hash('SenhaForte123');

    expect(hash).not.toBe('SenhaForte123');
    expect(hash.startsWith('')).toBe(true);
  });

  it('deve validar senha correta e rejeitar senha incorreta (fluxo feliz)', () => {
    const hasher = new PasswordHasher();
    const hash = hasher.hash('SenhaForte123');

    expect(hasher.compare('SenhaForte123', hash)).toBe(true);
    expect(hasher.compare('SenhaErrada123', hash)).toBe(false);
  });
});
