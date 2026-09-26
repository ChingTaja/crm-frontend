import { getLocation, navigate, resolveRoute, subscribeToLocation } from './lib/router'
import { ForgotPasswordView } from './features/auth/views/forgot-password-view'
import { ResetPasswordView } from './features/auth/views/reset-password-view'
import { AccessView } from './features/access/views/access-view'
import { OrderView } from './features/order/views/order-view'
import { ProductView } from './features/product/views/product-view'
import { OpportunityView } from './features/opportunity/views/opportunity-view'
import { LeadView } from './features/lead/views/lead-view'
import { ContactView } from './features/contact/views/contact-view'
import { QuoteView } from './features/quote/views/quote-view'
import { useQuoteClock } from './features/quote/view-models/use-quote-clock'
import { WorkspaceHeader } from './components/layout/workspace-header'
import { useEffect, useSyncExternalStore } from 'react'
import { LoginView } from './features/auth/views/login-view'
import { useLoginViewModel } from './features/auth/view-models/use-login-view-model'
import { CustomerView } from './features/customer/views/customer-view'
import { DashboardView } from './features/dashboard/views/dashboard-view'

function LoginPage() {
  const viewModel = useLoginViewModel(undefined, () => {
    navigate('/dashboard')
  })
  return <LoginView viewModel={{ ...viewModel, notice: viewModel.notice || (new URLSearchParams(window.location.search).get('passwordReset') === 'success' ? '密碼修改成功，請使用新密碼登入。' : '') }} />
}

const entityViews = { customers: CustomerView, contacts: ContactView, leads: LeadView, opportunities: OpportunityView, orders: OrderView, products: ProductView, quotes: QuoteView }

function App() {
  useQuoteClock()
  const location = useSyncExternalStore(subscribeToLocation, getLocation)
  const [pathname, query = ''] = location.split('?')
  const route = resolveRoute(pathname)
  const entity = route.split('/')[0]
  const recordId = route.split('/')[1]
  const EntityView = entityViews[entity]

  useEffect(() => {
    const titles = { 'forgot-password': '忘記密碼', 'reset-password': '設定新密碼', users: '帳號管理', roles: '角色權限', dashboard: '工作空間', customers: '客戶', contacts: '聯絡人', login: '登入', leads: '潛在客戶', opportunities: '商機', orders: '訂單', products: '產品', quotes: '報價單' }
    document.title = `${titles[route] ?? `${route.endsWith('/new') ? '新增' : '編輯'}${titles[route.split('/')[0]]}`} | Connect CRM`
  }, [route])

  if (route === 'login') return <LoginPage />
  if (route === 'forgot-password') return <ForgotPasswordView />
  if (route === 'reset-password') return <ResetPasswordView key={location} search={query} />

  return (
    <div className="flex min-h-svh flex-col">
      <WorkspaceHeader onReturnToLogin={() => { navigate('/login') }} />
      {['users', 'roles'].includes(entity) ? <AccessView key={entity} section={entity} /> : EntityView ? <EntityView key={entity} recordId={recordId} /> : <DashboardView />}
    </div>
  )
}

export default App
