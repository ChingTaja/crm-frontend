import type { ReactNode } from 'react';
import { LockKeyhole } from 'lucide-react';
import { BrandContent } from './brand-content';

export function PasswordResetLayout({ title, description, children }: {
  title: string; description: string; children: ReactNode;
}) {
  return <main className="grid min-h-svh grid-cols-1 bg-white text-[#263d37] min-[761px]:grid-cols-[47%_53%]">
    <BrandContent />
    <section className="flex items-center justify-center px-6 py-12" aria-labelledby="reset-title">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="grid size-12 place-items-center rounded-2xl border bg-[#f6f8f4] text-[#46684c]"><LockKeyhole /></div>
        <div>
          <h1 id="reset-title" className="text-3xl font-semibold">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {children}
        <a href="#/login" className="inline-block text-sm text-[#3b6550] underline">返回登入頁面</a>
      </div>
    </section>
  </main>;
}
