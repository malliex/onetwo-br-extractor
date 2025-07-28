export function logError(error: unknown, message?: string) {
  if (message) {
    console.error(`[Error] ${message}`);
  }
  if (error instanceof Error) {
    console.error(error.message);
    console.error(error.stack);
  } else {
    console.error(error);
  }
}
