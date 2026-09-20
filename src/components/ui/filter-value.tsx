import { CalendarDays, Hash, Link2, ListFilter, Mail, Phone, Text } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Lookup } from '@/components/ui/lookup'
import type { FilterField } from '@/lib/filter-fields'

export function FilterFieldIcon({ field }: { field: FilterField }) {
  const Icon = { text: Text, option: ListFilter, lookup: Link2, date: CalendarDays, number: Hash, email: Mail, phone: Phone }[field.type]
  return <Icon size={16} className="shrink-0" aria-hidden="true" />
}

export function FilterValue({ field, value, onChange }: { field: FilterField; value: string; onChange: (value: string) => void }) {
  if (field.type === 'lookup') {
    return <Lookup label={`${field.label}篩選值`} placeholder={`選擇${field.label}`} value={value} options={field.options ?? []} onValueChange={onChange} />
  }
  if (field.type === 'option') {
    return <select aria-label={`${field.label}篩選值`} className="h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={value} onChange={event => onChange(event.target.value)}>
      <option value="">請選擇{field.label}</option>
      {field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  }
  return <Input aria-label={`${field.label}篩選值`} className="h-9" type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'} step={field.type === 'number' ? 'any' : undefined} placeholder={field.label} value={value} onChange={event => onChange(event.target.value)} />
}
