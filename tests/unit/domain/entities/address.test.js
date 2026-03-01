import { describe, expect, it } from 'vitest';
import { Address } from '../../../../src/modules/domain/entities/address.js';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';

describe('Address', () => {
  it('deve criar endereço com dados válidos (fluxo feliz)', () => {
    // Arrange
    const address = Address.create({
      id: 'addr-1',
      customerId: 'cust-1',
      street: 'Rua A',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      country: 'BR',
      complement: 'Apto 1',
    });

    // Act
    const resultado = address;

    // Assert
    expect(resultado.id).toBe('addr-1');
    expect(resultado.customerId).toBe('cust-1');
    expect(resultado.createdAt).toBeTypeOf('string');
    expect(resultado.postalCode.toString()).toBe('60000-000');
  });

  it('deve falhar quando um campo obrigatório não for informado (caso de erro)', () => {
    // Arrange + Act + Assert
    expect(() =>
      Address.create({
        id: 'addr-1',
        customerId: 'cust-1',
        street: '',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '60000-000',
        country: 'BR',
      }),
    ).toThrow(ValidationError);
  });

  it('deve falhar quando id do endereço não for informado (caso de erro)', () => {
    // Arrange + Act + Assert
    expect(() =>
      Address.create({
        customerId: 'cust-1',
        street: 'Rua A',
        neighborhood: 'Centro',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '60000-000',
        country: 'BR',
      }),
    ).toThrow(ValidationError);
  });

  it('deve aceitar CEP com e sem hífen (caso de borda)', () => {
    // Arrange
    const withHyphen = Address.create({
      id: 'addr-2',
      customerId: 'cust-1',
      street: 'Rua A',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000-000',
      country: 'BR',
    });

    const withoutHyphen = Address.create({
      id: 'addr-3',
      customerId: 'cust-1',
      street: 'Rua B',
      neighborhood: 'Aldeota',
      city: 'Fortaleza',
      state: 'CE',
      postalCode: '60000000',
      country: 'BR',
    });

    // Act
    const cepComHifen = withHyphen.postalCode.toString();
    const cepSemHifen = withoutHyphen.postalCode.toString();

    // Assert
    expect(cepComHifen).toBe('60000-000');
    expect(cepSemHifen).toBe('60000-000');
  });

  it('deve falhar quando formato do CEP for inválido (caso de erro)', () => {
    // Arrange + Act + Assert
    expect(() =>
      Address.create({
        id: 'addr-4',
        customerId: 'cust-1',
        street: 'Rua C',
        neighborhood: 'Meireles',
        city: 'Fortaleza',
        state: 'CE',
        postalCode: '6000-000',
        country: 'BR',
      }),
    ).toThrow(ValidationError);
  });
});
