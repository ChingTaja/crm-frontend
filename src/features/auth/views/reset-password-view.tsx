import { passwordResetApi } from '../models/password-reset-service';
import { navigate } from '@/lib/router';
import { AppLink } from '@/components/ui/app-link';
import { useRef, useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LoginInput } from '../components/login-input';
import { PasswordResetLayout } from '../components/password-reset-layout';
import { resetToken, validateNewPassword } from '../models/password-reset';

export function ResetPasswordView({ search }: { search: string }) {
  const token = resetToken(search);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const request = useApi(passwordResetApi.resetPassword);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !token) return;
    busy.current = true;
    setError('');
    try {
      validateNewPassword(password, confirmation);
      await request.execute({ token, newPassword: password });
      setPassword('');
      setConfirmation('');
      // Replace the token-bearing history entry after successful reset.
      navigate('/login?passwordReset=success', { replace: true });
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === 'AbortError'))
        setError(cause instanceof Error ? cause.message : '無法修改密碼，請稍後再試。');
    } finally {
      busy.current = false;
    }
  }
  return (
    <PasswordResetLayout title="設定新密碼" description="請設定 8–72 個字元的新密碼，完成後將返回登入頁面。">
      {!token ? (
        <div role="alert" className="space-y-3">
          <p>重設密碼連結不完整，請重新申請。</p>
          <AppLink className="underline" href="/forgot-password">
            重新寄送重設信件
          </AppLink>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5" aria-busy={request.isLoading}>
          <Label htmlFor="new-password">新密碼</Label>
          <LoginInput
            id="new-password"
            icon={LockKeyhole}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            disabled={request.isLoading}
            onChange={(event) => setPassword(event.target.value)}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-7 shrink-0 text-[#8a988e]"
              aria-label={showPassword ? '隱藏新密碼' : '顯示新密碼'}
              aria-pressed={showPassword}
              aria-controls="new-password"
              disabled={request.isLoading}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </LoginInput>
          <Label htmlFor="confirm-password">確認新密碼</Label>
          <LoginInput
            id="confirm-password"
            icon={LockKeyhole}
            type={showConfirmation ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={confirmation}
            disabled={request.isLoading}
            onChange={(event) => setConfirmation(event.target.value)}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-7 shrink-0 text-[#8a988e]"
              aria-label={showConfirmation ? '隱藏確認新密碼' : '顯示確認新密碼'}
              aria-pressed={showConfirmation}
              aria-controls="confirm-password"
              disabled={request.isLoading}
              onClick={() => setShowConfirmation((current) => !current)}
            >
              {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </LoginInput>
          <Button type="submit" className="h-12 w-full bg-[#254e3c] text-white" disabled={request.isLoading}>
            {request.isLoading ? '修改中…' : '修改密碼'}
          </Button>
          {error && (
            <div role="alert" className="space-y-2 text-sm text-destructive">
              <p>{error}</p>
              <AppLink className="underline" href="/forgot-password">
                連結已失效？重新申請
              </AppLink>
            </div>
          )}
        </form>
      )}
    </PasswordResetLayout>
  );
}
