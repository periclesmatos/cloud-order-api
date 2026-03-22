import { describe, expect, it } from 'vitest';
import { PasswordHasher } from '../../../../src/modules/shared/providers/password-hasher.js';

describe('PasswordHasher (unit)', () => {
  it('deve gerar hash diferente da senha em texto puro (fluxo feliz)', () => {
    const hasher = new PasswordHasher();
    const hash = hasher.hash('A9!zT7#kL2');

    expect(hash).not.toBe('A9!zT7#kL2');
    expect(hash.startsWith('')).toBe(true);
  });

  it('deve validar senha correta e rejeitar senha incorreta (fluxo feliz)', () => {
    const hasher = new PasswordHasher();
    const hash = hasher.hash('A9!zT7#kL2');

    expect(hasher.compare('A9!zT7#kL2', hash)).toBe(true);
    expect(hasher.compare('B8@qP4%rN1', hash)).toBe(false);
  });
});
