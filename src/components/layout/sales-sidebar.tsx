import { AppLink } from '@/components/ui/app-link';
import { FileText, Target, Handshake, ShoppingCart, Package } from 'lucide-react'

export function SalesSidebar({ entity }: { entity: string }) {
  const selling = ['orders', 'products', 'quotes'].includes(entity)
  const links = selling
    ? [{ key: 'quotes', label: '報價單', english: 'Quote', icon: FileText }, { key: 'orders', label: '訂單', english: 'Order', icon: ShoppingCart }, { key: 'products', label: '產品', english: 'Product', icon: Package }]
    : [{ key: 'leads', label: '潛在客戶', english: 'Lead', icon: Target }, { key: 'opportunities', label: '商機', english: 'Opportunity', icon: Handshake }]
  return <aside className="border-r bg-[#f8f9f8] p-4">
    <p className="mb-3 px-3 text-xs text-muted-foreground">{selling ? '銷售管理' : '商機追蹤'}</p>
    <nav className="flex flex-wrap gap-1 md:grid">{links.map(({ key, label, english, icon: Icon }) => <AppLink key={key} href={`/${key}`} aria-current={entity === key ? 'page' : undefined} className="flex flex-1 items-center gap-2 rounded-lg p-3 text-muted-foreground hover:bg-muted aria-[current=page]:bg-[#e9eee7] aria-[current=page]:text-[#284c36]"><Icon size={18} />{label}<span className="ml-auto text-[10px]">{english}</span></AppLink>)}</nav>
  </aside>
}
