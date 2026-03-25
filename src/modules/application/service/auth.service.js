import { User } from '../../domain/entities/user.js';
import { Email } from '../../domain/value-object/email.js';
import { Phone } from '../../domain/value-object/phone.js';
import { ValidationError } from '../../domain/errors/validation.error.js';
import { UnauthorizedError } from '../errors/unauthorized.error.js';

export class AuthService {
  constructor(userRepository, customerRepository, uuidGenerator, passwordHasher, tokenService) {
    this.userRepository = userRepository;
    this.customerRepository = customerRepository;
    this.uuidGenerator = uuidGenerator;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  validatePassword(password) {
    if (typeof password !== 'string' || password.length < 8) {
      throw new ValidationError('Senha deve ter no mínimo 8 caracteres');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      throw new ValidationError('Senha deve conter letra maiúscula, minúscula e número');
    }
  }

  async registerUser(registerData) {
    const { name, email, password } = registerData ?? {};
    if (!name) throw new ValidationError('Nome do usuário é obrigatório');
    if (!email) throw new ValidationError('E-mail é obrigatório');
    if (!password) throw new ValidationError('Senha é obrigatória');

    this.validatePassword(password);
    const normalizedEmail = new Email(email).toString();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ValidationError('E-mail já cadastrado para outro usuário');
    }

    const user = User.create({
      id: this.uuidGenerator.generate(),
      name,
      email: normalizedEmail,
      passwordHash: this.passwordHasher.hash(password),
      role: 'ADMIN',
    });

    await this.userRepository.saveUser(user);
    return {
      user,
      accessToken: this.tokenService.sign({ sub: user.id, type: 'USER', role: user.role }),
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  async loginUser(loginData) {
    const { email, password } = loginData ?? {};
    if (!email || !password) {
      throw new ValidationError('E-mail e senha são obrigatórios');
    }

    const normalizedEmail = new Email(email).toString();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user || !this.passwordHasher.compare(password, user.passwordHash)) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    return {
      actor: {
        id: user.id,
        type: 'USER',
        role: user.role,
        name: user.name,
        email: user.email.toString(),
      },
      accessToken: this.tokenService.sign({ sub: user.id, type: 'USER', role: user.role }),
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  async loginCustomer(loginData) {
    const { phone } = loginData ?? {};
    if (!phone) {
      throw new ValidationError('Telefone é obrigatório');
    }
    const normalizedPhone = new Phone(phone).toString();
    const customer = await this.customerRepository.findByPhone(normalizedPhone);
    if (!customer) {
      throw new UnauthorizedError('Cliente não encontrado para autenticação');
    }

    return {
      actor: {
        id: customer.id,
        type: 'CUSTOMER',
        name: customer.name,
        phone: customer.phone.toString(),
      },
      accessToken: this.tokenService.sign({ sub: customer.id, type: 'CUSTOMER' }),
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  async getMe(userId, userType) {
    if (userType === 'USER') {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedError('Usuário não encontrado');
      }
      return {
        id: user.id,
        type: 'USER',
        name: user.name,
        email: user.email.toString(),
        role: user.role,
      };
    }

    if (userType === 'CUSTOMER') {
      const customer = await this.customerRepository.findById(userId);
      if (!customer) {
        throw new UnauthorizedError('Cliente não encontrado');
      }
      return {
        id: customer.id,
        type: 'CUSTOMER',
        name: customer.name,
        phone: customer.phone.toString(),
      };
    }

    throw new UnauthorizedError('Tipo de usuário inválido');
  }
}
