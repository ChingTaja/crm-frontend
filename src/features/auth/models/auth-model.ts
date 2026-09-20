export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthService {
  signIn(credentials: LoginCredentials): Promise<void>;
}

// Temporary mock: resolves without verifying credentials or creating a session.
// Replace this adapter with the real authentication API when it is available.
export const authService: AuthService = {
  async signIn() {
    return Promise.resolve();
  },
};
