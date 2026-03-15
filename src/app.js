import 'dotenv/config';
import chalk from 'chalk';

import { createApp } from './app.factory.js';
import { logger } from './modules/shared/logger/console-logger.js';

const app = createApp();

const startupBanner = `
   _____ _                 _    ____          _           
  / ____| |               | |  / __ \\        | |          
 | |    | | ___  _   _  __| | | |  | |_ __ __| | ___ _ __ 
 | |    | |/ _ \\| | | |/ _\` | | |  | | '__/ _\` |/ _ \\ '__|
 | |____| | (_) | |_| | (_| | | |__| | | | (_| |  __/ |   
  \\_____|_|\\___/ \\__,_|\\__,_|  \\____/|_|  \\__,_|\\___|_|   

                    Cloud Order API
`;

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info('App', `\n${chalk.green(startupBanner)}`);
  logger.info('App', `${chalk.green("🚀 Server started")}`);
  logger.info('App', `API rodando em http://localhost:${port}`);
});

export default app;
