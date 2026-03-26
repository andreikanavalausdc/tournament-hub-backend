import { isNotEmptyObject } from 'class-validator';

export function isObject(val: unknown): val is Record<string, unknown> {
  return isNotEmptyObject(val, { nullable: false });
}
