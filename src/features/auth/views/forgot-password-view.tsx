import { useRef, useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LoginInput } from '../components/login-input';
import { PasswordResetLayout } from '../components/password-reset-layout';
import { passwordResetService } from '../models/password-reset';

const sendReset = (signal: AbortSignal, email: string) => passwordResetService.requestReset(
  email, `${window.location.origin}/reset-password`, signal,
);

export function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const busy = useRef(false);
  const request = useApi(sendReset);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    try { await request.execute(email.trim()); setSent(true); }
    catch { /* useApi exposes the failure. */ }
    finally { busy.current = false; }
  }
  return <PasswordResetLayout title="忘記密碼" description="輸入帳號使用的電子郵件，我們會寄送重設密碼連結。">
    {sent ? <div role="status" className="space-y-4 rounded-lg border bg-[#f6f8f4] p-5">
      <p>若此信箱已註冊，你將收到重設密碼信件。請檢查收件匣與垃圾郵件，點擊信件中的連結設定新密碼。</p>
      <Button variant="outline" onClick={() => { setSent(false); request.reset(); }}>重新寄送或更換信箱</Button>
    </div> : <form onSubmit={submit} className="space-y-5" aria-busy={request.isLoading}>
      <Label htmlFor="reset-email">電子郵件</Label>
      <LoginInput id="reset-email" icon={Mail} type="email" autoComplete="email" required
        placeholder="name@gmail.com" value={email} disabled={request.isLoading}
        onChange={event => setEmail(event.target.value)} />
      <Button type="submit" className="h-12 w-full bg-[#254e3c] text-white" disabled={request.isLoading}>
        {request.isLoading ? '寄送中…' : '寄送重設密碼信件'}
      </Button>
      {request.error && <p role="alert" className="text-sm text-destructive">{request.error.message}</p>}
    </form>}
  </PasswordResetLayout>;
}
