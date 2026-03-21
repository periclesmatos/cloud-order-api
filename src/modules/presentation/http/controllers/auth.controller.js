import { logger } from '../../../shared/logger/console-logger.js';

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    logger.info('AUTH', 'USER REGISTER REQUEST', { name, email });

    const result = await this.authService.registerUser({ name, email, password });
    logger.info('AUTH', 'USER REGISTER SUCCESS', { id: result.user.id, email: result.user.email.toString() });

    return res.status(201).json({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email.toString(),
        role: result.user.role,
      },
      accessToken: result.accessToken,
      tokenType: result.tokenType,
      expiresIn: result.expiresIn,
    });
  };

  loginUser = async (req, res) => {
    const { email } = req.body;
    logger.info('AUTH', 'USER LOGIN REQUEST', { email });

    const result = await this.authService.loginUser(req.body);
    logger.info('AUTH', 'USER LOGIN SUCCESS', { actorId: result.actor.id, actorType: result.actor.type });
    return res.status(200).json(result);
  };

  loginCustomer = async (req, res) => {
    const { phone } = req.body;
    logger.info('AUTH', 'CUSTOMER LOGIN REQUEST', { phone });

    const result = await this.authService.loginCustomer(req.body);
    logger.info('AUTH', 'CUSTOMER LOGIN SUCCESS', { actorId: result.actor.id, actorType: result.actor.type });
    return res.status(200).json(result);
  };
}
