const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const LEVEL_COLORS = {
  INFO: ANSI.green,
  WARN: ANSI.yellow,
  ERROR: ANSI.red,
  DEBUG: ANSI.cyan,
};

const CONTEXT_COLORS = {
  CustomerController: ANSI.blue,
  CustomerService: ANSI.magenta,
  CustomerRepository: ANSI.cyan,
  Phone: ANSI.yellow,
  App: ANSI.green,
};

function colorize(text, color) {
  return `${color}${text}${ANSI.reset}`;
}

function writeLog(level, context, message, data) {
  if (process.env.NODE_ENV === 'test' && level === 'DEBUG') {
    return;
  }

  const ts = colorize(new Date().toISOString(), ANSI.dim);
  const levelColor = LEVEL_COLORS[level] ?? ANSI.blue;
  const contextColor = CONTEXT_COLORS[context] ?? ANSI.blue;
  const levelLabel = colorize(level.padEnd(5), levelColor);
  const contextLabel = colorize(`[${context}]`, contextColor);

  if (data !== undefined) {
    console.log(`${ts} ${levelLabel} ${contextLabel} ${message}`, data);
    return;
  }

  console.log(`${ts} ${levelLabel} ${contextLabel} ${message}`);
}

export const logger = {
  info(context, message, data) {
    writeLog('INFO', context, message, data);
  },
  warn(context, message, data) {
    writeLog('WARN', context, message, data);
  },
  error(context, message, data) {
    writeLog('ERROR', context, message, data);
  },
  debug(context, message, data) {
    writeLog('DEBUG', context, message, data);
  },
};
