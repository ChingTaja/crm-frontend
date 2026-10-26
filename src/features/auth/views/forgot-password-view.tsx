import { useRateLimit } from '@/hooks/use-rate-limit';
import { useRef, useState, type FormEvent } from 'react';
import { Mail, TriangleAlert } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LoginInput } from '../components/login-input';
import { PasswordResetLayout } from '../components/password-reset-layout';
import { passwordResetApi } from '../models/password-reset-service';

export function ForgotPasswordView() {
  const rateLimit = useRateLimit();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const busy = useRef(false);
  const request = useApi(passwordResetApi.requestReset);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || rateLimit.isBlocked()) return;
    busy.current = true;
    try {
      await request.execute({ email: email.trim() });
      setSent(true);
    } catch (error) {
      rateLimit.capture(error);
    } finally {
      busy.current = false;
    }
  }
  return (
    <PasswordResetLayout
      title="忘記密碼"
      description="輸入帳號使用的電子郵件，我們會寄送重設密碼連結。"
      footer={
        <aside
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900"
          aria-labelledby="password-reset-notice-title"
        >
          <h3 id="password-reset-notice-title" className="mb-2 flex items-center gap-2 font-semibold">
            <TriangleAlert size={16} className="shrink-0" aria-hidden="true" />
            忘記密碼功能說明
          </h3>
          <p>
            本系統已完成忘記密碼功能，但因目前使用的 Resend 免費郵件服務仍處於測試模式，僅允許寄信至開發者已驗證的
            Email，因此目前僅開發者本人能完整測試此功能，其他 Demo 使用者暫時無法使用。
          </p>
          <p className="mt-2">此限制來自郵件服務的設定，並非系統功能尚未實作，敬請見諒。</p>
        </aside>
      }
    >
      {sent ? (
        <div role="status" className="space-y-4 rounded-lg border bg-[#f6f8f4] p-5">
          <p>若此信箱已註冊，你將收到重設密碼信件。請檢查收件匣與垃圾郵件，點擊信件中的連結設定新密碼。</p>
          <Button
            variant="outline"
            onClick={() => {
              setSent(false);
              request.reset();
            }}
          >
            重新寄送或更換信箱
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5" aria-busy={request.isLoading}>
          <Label htmlFor="reset-email">電子郵件</Label>
          <LoginInput
            id="reset-email"
            icon={Mail}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="name@gmail.com"
            value={email}
            disabled={request.isLoading || rateLimit.remainingSeconds > 0}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button
            type="submit"
            className="h-12 w-full bg-[#254e3c] text-white"
            disabled={request.isLoading || rateLimit.remainingSeconds > 0}
          >
            {rateLimit.message || (request.isLoading ? '寄送中…' : '寄送重設密碼信件')}
          </Button>
          {request.error && (
            <p role="alert" className="text-sm text-destructive">
              {request.error.message}
            </p>
          )}
        </form>
      )}
    </PasswordResetLayout>
  );
}
