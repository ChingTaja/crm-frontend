const storageKey = 'crm.accessToken';
let memoryToken: string | null = null;

export const authSession = {
  getToken(): string | null {
    try {
      return sessionStorage.getItem(storageKey) ?? memoryToken;
    } catch {
      return memoryToken;
    }
  },
  setToken(token: string) {
    memoryToken = token;
    try {
      sessionStorage.setItem(storageKey, token);
    } catch {
      /* Memory fallback when storage is unavailable. */
    }
  },
  clear() {
    memoryToken = null;
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* Storage may be unavailable. */
    }
  },
};
