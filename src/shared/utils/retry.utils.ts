export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const retry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const retries = Math.max(0, options.retries ?? 3);
  const delayMs = Math.max(0, options.delayMs ?? 250);
  const backoffMultiplier = Math.max(1, options.backoffMultiplier ?? 2);
  const shouldRetry = options.shouldRetry ?? (() => true);

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error, attempt + 1)) {
        throw error;
      }

      await sleep(delayMs * backoffMultiplier ** attempt);
    }
  }
};