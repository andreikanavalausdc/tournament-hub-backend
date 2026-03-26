export function getExceptionWithArgs(message: string, args: Record<string, unknown>): string {
  return JSON.stringify({
    key: message,
    args,
  });
}
