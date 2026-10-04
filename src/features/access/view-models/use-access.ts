import { createContext, useContext } from 'react';
import type { CurrentUserResponse } from '../../../api/Api';
export const AccessContext = createContext<{ me?: CurrentUserResponse; can: (code: string) => boolean; refresh: () => void }>({ can: () => false, refresh: () => {} });
export function useAccess() { return useContext(AccessContext); }
