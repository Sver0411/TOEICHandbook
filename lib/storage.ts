export function readSetting<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`toeic:${key}`);
    return value === null ? fallback : (JSON.parse(value) as T);
  } catch {
    return fallback;
  }
}
export function writeSetting(key: string, value: unknown) {
  try {
    localStorage.setItem(`toeic:${key}`, JSON.stringify(value));
  } catch {
    /* Reading remains available when browser storage is disabled. */
  }
}
