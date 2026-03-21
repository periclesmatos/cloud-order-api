import { ValidationError } from '../errors/validation.error.js';
import { Email } from '../value-object/email.js';

export class User {
  constructor({ id, name, email, passwordHash, role, isActive, createdAt, updatedAt }) {
    if (!id) throw new ValidationError('ID do usuário é obrigatório');
    if (!name) throw new ValidationError('Nome do usuário é obrigatório');
    if (!passwordHash) throw new ValidationError('Hash da senha é obrigatório');

    const normalizedName = String(name).trim();
    if (!normalizedName) throw new ValidationError('Nome do usuário é obrigatório');

    this.id = id;
    this.name = normalizedName;
    this.email = new Email(email);
    this.passwordHash = passwordHash;
    this.role = role ?? 'ADMIN';
    this.isActive = isActive ?? true;
    this.createdAt = createdAt ?? new Date().toISOString();
    this.updatedAt = updatedAt ?? this.createdAt;
  }

  static create({ id, name, email, passwordHash, role, createdAt }) {
    return new User({ id, name, email, passwordHash, role, createdAt });
  }
}
