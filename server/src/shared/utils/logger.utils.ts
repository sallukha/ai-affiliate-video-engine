export type LogContext = Record<string, unknown>;

const formatContext = (context?: LogContext): string =>
  context === undefined ? '' : ` ${JSON.stringify(context)}`;

export const logger = {
  info(message: string, context?: LogContext): void {
    console.info(`[INFO] ${message}${formatContext(context)}`);
  },
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}${formatContext(context)}`);
  },
  error(message: string, context?: LogContext): void {
    console.error(`[ERROR] ${message}${formatContext(context)}`);
  },
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}${formatContext(context)}`);
    }
  },
};