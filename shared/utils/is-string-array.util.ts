import { isString } from 'class-validator';

export function isStringArray(val: unknown): val is string[] {
  if (!Array.isArray(val)) {
    return false;
  }

  for (const item of val) {
    if (!isString(item)) {
      return false;
    }
  }

  return true;
}
