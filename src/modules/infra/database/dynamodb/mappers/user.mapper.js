import { User } from '../../../../domain/entities/user.js';

export function toUserItem(user) {
  return {
    PK: `USER#${user.id}`,
    SK: 'PROFILE',
    type: 'USER',
    userId: user.id,
    name: user.name,
    email: user.email.toString(),
    passwordHash: user.passwordHash,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    LKP_PK: `EMAIL#${user.email.toString()}`,
    LKP_SK: `USER#${user.id}`,
  };
}

export function toEmailLockItem(user) {
  return {
    PK: `EMAIL#${user.email.toString()}`,
    SK: 'LOCK',
    type: 'EmailLock',
    userId: user.id,
    createdAt: new Date().toISOString(),
  };
}

export function toDomainUser(item) {
  if (!item) return null;

  return new User({
    id: item.userId,
    name: item.name,
    email: item.email,
    passwordHash: item.passwordHash,
    role: item.role,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });
}
