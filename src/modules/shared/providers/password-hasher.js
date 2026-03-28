import bcrypt from 'bcryptjs';

export class PasswordHasher {
  constructor(rounds = process.env.NODE_ENV === 'test' ? 2 : 12) {
    this.rounds = rounds;
  }

  hash(password) {
    return bcrypt.hashSync(password, this.rounds);
  }

  compare(password, hashedPassword) {
    if (!hashedPassword || typeof hashedPassword !== 'string') {
      return false;
    }
    if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$') && !hashedPassword.startsWith('$2y$')) {
      return false;
    }
    return bcrypt.compareSync(password, hashedPassword);
  }
}
