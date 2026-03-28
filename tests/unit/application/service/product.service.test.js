import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductService } from '../../../../src/modules/application/service/porduct.service.js';
import { Product } from '../../../../src/modules/domain/entities/product.js';
import { ValidationError } from '../../../../src/modules/domain/errors/validation.error.js';

describe('ProductService (unit)', () => {
  let repository;
  let uuidGenerator;
  let service;

  beforeEach(() => {
    repository = {
      saveProduct: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      deleteById: vi.fn(),
    };

    uuidGenerator = {
      generate: vi.fn(() => 'prod-123'),
    };

    service = new ProductService(repository, uuidGenerator);
  });

  it('deve criar produto com sucesso (fluxo feliz)', async () => {
    repository.saveProduct.mockImplementation(async (product) => product);

    const result = await service.createProduct({
      name: 'Teclado',
      price: 199.9,
      amount: 5,
      description: 'Teclado mecanico RGB',
    });

    expect(repository.saveProduct).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('prod-123');
    expect(result.name).toBe('Teclado');
  });

  it('deve listar todos os produtos com filtro de status (fluxo feliz)', async () => {
    repository.findAll.mockResolvedValue([]);

    await service.getAllProducts({ isActive: true });

    expect(repository.findAll).toHaveBeenCalledWith({ isActive: true });
  });

  it('deve listar produtos por nome com filtro de status (fluxo feliz)', async () => {
    repository.findByName.mockResolvedValue([]);

    await service.getProductsByName('mouse', { isActive: true });

    expect(repository.findByName).toHaveBeenCalledWith('mouse', { isActive: true });
  });

  it('deve atualizar produto existente (fluxo feliz)', async () => {
    const product = Product.create({
      id: 'prod-1',
      name: 'Mouse',
      price: 99.9,
      amount: 10,
      description: 'Mouse com sensor optico',
    });
    repository.findById.mockResolvedValue(product);
    repository.update.mockImplementation(async (updated) => updated);

    const result = await service.updateProduct('prod-1', { price: 79.9, amount: 7 });

    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(result.price.toNumber()).toBe(79.9);
    expect(result.amount).toBe(7);
  });

  it('deve falhar ao atualizar produto inexistente (caso de erro)', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.updateProduct('prod-x', { name: 'Novo' })).rejects.toThrow(ValidationError);
  });

  it('deve excluir produto existente (fluxo feliz)', async () => {
    repository.findById.mockResolvedValue({ id: 'prod-1' });

    await service.deleteProduct('prod-1');

    expect(repository.deleteById).toHaveBeenCalledWith('prod-1');
  });

  it('deve falhar ao excluir produto inexistente (caso de erro)', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.deleteProduct('prod-x')).rejects.toThrow(ValidationError);
  });

  it('deve ativar produto inativo via update de status (fluxo feliz)', async () => {
    const product = Product.create({
      id: 'prod-1',
      name: 'Headset',
      price: 250,
      amount: 3,
      description: 'Headset com cancelamento de ruido',
    });
    product.deactivate();

    repository.findById.mockResolvedValue(product);
    repository.update.mockImplementation(async (updated) => updated);

    const result = await service.setProductStatus('prod-1', true);

    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(result.isActive).toBe(true);
  });

  it('deve desativar produto ativo via update de status (fluxo feliz)', async () => {
    const product = Product.create({
      id: 'prod-1',
      name: 'Headset',
      price: 250,
      amount: 3,
      description: 'Headset com cancelamento de ruido',
    });

    repository.findById.mockResolvedValue(product);
    repository.update.mockImplementation(async (updated) => updated);

    const result = await service.setProductStatus('prod-1', false);

    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(result.isActive).toBe(false);
  });

  it('deve falhar ao atualizar status de produto inexistente (caso de erro)', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.setProductStatus('prod-x', true)).rejects.toThrow(ValidationError);
  });

  it('deve falhar ao atualizar status com valor invalido (caso de erro)', async () => {
    repository.findById.mockResolvedValue({
      id: 'prod-1',
      activate: vi.fn(),
      deactivate: vi.fn(),
    });

    await expect(service.setProductStatus('prod-1', 'sim')).rejects.toThrow(ValidationError);
  });
});
