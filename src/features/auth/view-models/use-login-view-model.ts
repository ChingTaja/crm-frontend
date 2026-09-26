import { navigate } from '@/lib/router';
import { useRef, useState, type FormEvent } from 'react';
import { authService, type AuthService, type LoginCredentials } from '../models/auth-model';

export function useLoginViewModel(service: AuthService = authService, onSignedIn?: () => void) {
  const [credentials, setCredentials] = useState<LoginCredentials>({ code: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);

  function updateField(field: keyof LoginCredentials, value: string) {
    setCredentials((current) => ({ ...current, [field]: value }));
    setNotice('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setNotice('');
    try {
      if (!credentials.code.trim()) throw new Error('請輸入帳號。');
      await service.signIn({ ...credentials, code: credentials.code.trim() });
      setNotice('登入成功。');
      setCredentials({ code: '', password: '' });
      onSignedIn?.();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '暫時無法登入，請稍後再試。');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    credentials,
    showPassword,
    notice,
    isSubmitting,
    updateField,
    submit,
    togglePassword: () => setShowPassword((current) => !current),
    requestAccount: () => setNotice('請聯絡貴公司的系統管理員，協助您開通 CRM 帳號。'),
    requestPasswordReset: () => { navigate('/forgot-password'); },
  };
}

export type LoginViewModel = ReturnType<typeof useLoginViewModel>;
