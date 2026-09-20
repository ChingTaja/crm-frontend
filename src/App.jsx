import { QuoteView } from './features/quotes/views/quote-view'
import { useQuoteClock } from './features/quotes/view-models/use-quote-clock'
import { SalesView } from './features/sales/views/sales-view'
import { WorkspaceHeader } from './components/layout/workspace-header'
import { useEffect, useSyncExternalStore } from 'react'
import { LoginView } from './features/auth/views/login-view'
import { useLoginViewModel } from './features/auth/view-models/use-login-view-model'
import { CustomerView } from './features/customers/views/customer-view'
import { useCustomerViewModel } from './features/customers/view-models/use-customer-view-model'
import { DashboardView } from './features/dashboard/views/dashboard-view'

function subscribeToRoute(onChange) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function getRoute() {
  const path = window.location.hash.slice(2)
  return ['dashboard', 'customers', 'contacts', 'leads', 'opportunities', 'orders', 'products', 'quotes'].includes(path) || /^(customers|contacts|leads|opportunities|orders|products|quotes)\/new$/.test(path) || /^(customers|contacts|leads|opportunities|orders|products|quotes)\/[^/]+\/edit$/.test(path) ? path : 'login'
}

function LoginPage() {
  const viewModel = useLoginViewModel(undefined, () => {
    window.location.hash = '/dashboard'
  })
  return <LoginView viewModel={viewModel} />
}

function CustomerPage({ entity, recordId }) {
  const viewModel = useCustomerViewModel(entity, recordId)
  return <CustomerView viewModel={viewModel} />
}

function App() {
  useQuoteClock()
  const route = useSyncExternalStore(subscribeToRoute, getRoute)
  const entity = route.split('/')[0]
  const recordId = route.split('/')[1]

  useEffect(() => {
    const titles = { dashboard: '工作空間', customers: '客戶', contacts: '聯絡人', login: '登入', leads: '潛在客戶', opportunities: '商機', orders: '訂單', products: '產品', quotes: '報價單' }
    document.title = `${titles[route] ?? `${route.endsWith('/new') ? '新增' : '編輯'}${titles[route.split('/')[0]]}`} | Connect CRM`
  }, [route])

  if (route === 'login') return <LoginPage />

  return (
    <div className="flex min-h-svh flex-col">
      <WorkspaceHeader onReturnToLogin={() => { window.location.hash = '/login' }} />
      {entity === 'customers' || entity === 'contacts'
        ? <CustomerPage key={entity} entity={entity} recordId={recordId} />
        : entity === 'quotes'
          ? <QuoteView recordId={recordId} />
          : ['leads', 'opportunities', 'orders', 'products'].includes(entity)
          ? <SalesView key={entity} entity={entity} recordId={recordId} />
          : <DashboardView />}
    </div>
  )
}

export default App
