import { randomUUID } from 'crypto';

export class UuidGenerator {
  generate() {
    return randomUUID();
  }
}
