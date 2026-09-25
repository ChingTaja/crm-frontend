import { LayoutDashboard, Users, Handshake, ShoppingCart, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

function DashboardView() {
  return (
    <div className="flex-1 bg-[#f5f7f3] text-[#263d37]">
      <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-10 sm:py-14">
        <div className="flex items-center gap-2 text-sm text-[#66816e]">
          <LayoutDashboard size={17} /> 工作空間 / 總覽
        </div>
        <div>
          <h1
            tabIndex={-1}
            ref={(element) => {
              element?.focus();
            }}
            className="text-3xl font-semibold tracking-wide outline-none"
          >
            歡迎來到您的工作空間
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">從這裡開始，讓每一段客戶關係更進一步。</p>
        </div>
        <Alert className="border-[#dce6d5] bg-[#eef3e9]">
          <AlertDescription>目前為前端預覽模式，尚未驗證帳號或連接後端資料。</AlertDescription>
        </Alert>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: '客戶管理', description: '集中管理客戶資訊與聯絡紀錄。', icon: Users, href: '#/customers' },
            { title: '商機追蹤', description: '掌握商機進度與每一次合作機會。', icon: Handshake, href: '#/leads' },
            {
              title: '銷售管理',
              description: '管理報價版本、訂單明細與產品資訊。',
              icon: ShoppingCart,
              href: '#/orders',
            },
            { title: '權限管理', description: '管理成員角色與存取權限。', icon: ShieldCheck, href: '#/users' },
          ].map(({ title, description, icon: Icon, href }) => (
            <Card
              key={title}
              className={
                href
                  ? 'relative transition-all duration-200 hover:-translate-y-1 hover:bg-[#f5f9f1] hover:ring-[#9bb28e] hover:shadow-md focus-within:ring-2 focus-within:ring-[#56775e]'
                  : undefined
              }
            >
              <CardHeader>
                <Icon className="mb-4 text-[#56775e]" aria-hidden="true" />
                <CardTitle>
                  {href ? (
                    <a href={href} className="outline-none after:absolute after:inset-0 after:rounded-xl">
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-muted-foreground">
                  {href
                    ? title === '權限管理'
                      ? '管理帳號與角色 →'
                      : title === '客戶管理'
                      ? '查看客戶與聯絡人 →'
                      : title === '商機追蹤'
                        ? '查看 潛在客戶 與 商機 →'
                        : '查看報價單、訂單與產品 →'
                    : '功能準備中'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export { DashboardView };
