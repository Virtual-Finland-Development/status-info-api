export function ensureObject(obj: any) {
  if (typeof obj !== "object" || obj === null) {
    return {};
  }
  return obj;
}
