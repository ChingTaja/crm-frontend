let memoryToken: string | null = null;
let expiresAt: number | null = null;
let generation = 0;

function removeLegacyToken() {
  try {
    sessionStorage.removeItem('crm.accessToken');
  } catch {
    /* Storage may be unavailable. */
  }
}
function store(token: string, expiresIn?: number) {
  memoryToken = token;
  expiresAt =
    typeof expiresIn === 'number' && Number.isFinite(expiresIn) && expiresIn > 0 ? Date.now() + expiresIn * 1000 : null;
  removeLegacyToken();
}
export const authSession = {
  getToken: () => memoryToken,
  getExpiresAt: () => expiresAt,
  getGeneration: () => generation,
  setToken(token: string, expiresIn?: number) {
    generation++;
    store(token, expiresIn);
  },
  updateFromRefresh(token: string, expiresIn: number, expectedGeneration: number) {
    if (generation !== expectedGeneration) return false;
    store(token, expiresIn);
    return true;
  },
  invalidatePending() {
    generation++;
  },
  clear() {
    generation++;
    memoryToken = null;
    expiresAt = null;
    removeLegacyToken();
  },
};
removeLegacyToken();
