import pino from 'pino';

const isTest = process.env.NODE_ENV === 'test';
const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: isTest ? 'silent' : 'info',
  ...(isDev && !isTest
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}),
});
