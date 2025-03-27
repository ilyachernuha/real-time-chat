import { z } from "zod";

export function zEnumFromObject<T extends Record<string, unknown>>(obj: T) {
  return z.enum(Object.keys(obj) as [keyof T & string]);
}
