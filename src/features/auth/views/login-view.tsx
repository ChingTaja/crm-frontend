import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginInput } from '../components/login-input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LoginViewModel } from '../view-models/use-login-view-model';
import { BrandContent } from '../components/brand-content';

function LoginView({ viewModel }: { viewModel: LoginViewModel }) {
  const {
    credentials,
    showPassword,
    notice,
    isSubmitting,
    updateField,
    submit,
    togglePassword,
    requestPasswordReset,
  } = viewModel;
  return (
    <main className="grid min-h-svh grid-cols-1 bg-white text-[#263d37] min-[761px]:grid-cols-[47%_53%]">
      <BrandContent />

      <section className="flex min-h-[610px] min-w-0 flex-col px-6 py-6 min-[761px]:px-8 min-[761px]:pt-8 min-[1001px]:px-12 min-[1001px]:pt-10" aria-labelledby="login-title">
        <div className="m-auto w-full max-w-[400px] py-8 min-[761px]:max-w-[370px] min-[761px]:pt-15 min-[761px]:pb-10 min-[1500px]:max-w-[400px]">
          <div className="mb-7 hidden size-12 place-items-center rounded-2xl border border-[#e0e8df] bg-[#f6f8f4] text-[#46684c] min-[761px]:grid">
            <LockKeyhole size={23} strokeWidth={1.6} />
          </div>
          <span className="text-[9px] font-semibold tracking-[2px] text-[#8b988a]">YOUR WORKSPACE AWAITS</span>
          <h2 id="login-title" className="mt-3 mb-2.5 text-[28px] font-semibold tracking-wide min-[761px]:text-[31px]">歡迎回來</h2>
          <p className="mb-7 text-[13px] text-[#8b938d] min-[761px]:mb-9">登入您的帳號，開始今天的美好連結。</p>
          <form onSubmit={submit} aria-busy={isSubmitting}>
            <Label className="mb-2 text-xs" htmlFor="email">電子郵件</Label>
            <LoginInput icon={Mail}
                id="email"
                name="email"
                value={credentials.email}
                onChange={(event) => updateField('email', event.target.value)}
                disabled={isSubmitting}
                type="email"
                autoComplete="username"
                placeholder="name@company.com"
                required
              />
            <div className="mt-6 mb-2 flex items-center justify-between">
              <Label className="text-xs" htmlFor="password">密碼</Label>
              <Button variant="link" className="h-auto px-0 py-1 text-[11px] text-[#3b6550]" type="button" onClick={requestPasswordReset}>
                忘記密碼？
              </Button>
            </div>
            <LoginInput icon={LockKeyhole}
                id="password"
                name="password"
                value={credentials.password}
                onChange={(event) => updateField('password', event.target.value)}
                disabled={isSubmitting}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="請輸入您的密碼"
                required
              >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-7 shrink-0 cursor-pointer text-[#8a988e]"
                type="button"
                aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                aria-pressed={showPassword}
                onClick={togglePassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </LoginInput>
            <div className="mt-4 mb-6 flex items-center gap-1.5 text-[11px] text-[#8d998e]">
              <ShieldCheck size={15} /> 使用您的公司帳號安全登入
            </div>
            <Button className="h-12 w-full cursor-pointer gap-4 rounded-lg bg-[#254e3c] text-[13px] text-white shadow-sm hover:bg-[#193d2d] active:translate-y-px disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '登入中…' : '登入工作空間'} <ArrowRight size={18} />
            </Button>
            <div className="mt-3 min-h-10 text-xs leading-relaxed text-[#6b7056]" role="status" aria-live="polite">
              {notice && (
                <Alert className="border-[#e1e7d7] bg-[#f5f7ef]" role="presentation">
                  <AlertDescription className="text-xs text-[#6b7056]">{notice}</AlertDescription>
                </Alert>
              )}
            </div>
          </form>
          <div className="mt-2 flex items-center gap-3 text-[10px] whitespace-nowrap text-[#9ca69b]">
            <span className="h-px flex-1 bg-[#edf0e9]" />
            專注關係，讓成長自然發生
            <span className="h-px flex-1 bg-[#edf0e9]" />
          </div>
          <p className="mt-5 text-center text-[11px] text-[#a0a99f]">專屬於您與團隊的客戶管理空間。</p>
        </div>
        <footer className="mx-auto flex w-full max-w-[400px] flex-wrap justify-between gap-3 text-[9px] text-[#9ba49b] min-[761px]:max-w-none min-[761px]:text-[10px]">
          <span>© {new Date().getFullYear()} Connect CRM</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} /> 用心連結每一份信任
          </span>
        </footer>
      </section>
    </main>
  );
}

export { LoginView };
