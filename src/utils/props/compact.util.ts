function compact<T extends Record<string, unknown>>(value: T): T {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    if (value[key] !== undefined) {
      result[key] = value[key];
    }
  }
  return result as T;
}

export { compact };
