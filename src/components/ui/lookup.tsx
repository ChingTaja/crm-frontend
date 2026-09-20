import { useId, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'

export interface LookupOption {
  value: string
  label: string
  keywords?: string
}

interface LookupProps {
  id?: string
  label: string
  value: string
  options: LookupOption[]
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

const PAGE_SIZE = 10

/** Search all supplied options; reveal matches in batches of ten. */
export function Lookup({ id, label, value, options, onValueChange, placeholder = '請選擇', disabled, required }: LookupProps) {
  const searchId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const selected = options.find(option => option.value === value)
  const term = query.trim().toLocaleLowerCase()
  const matches = options.filter(option => `${option.label} ${option.keywords ?? ''}`.toLocaleLowerCase().includes(term))
  const visible = matches.slice(0, limit)

  function changeOpen(next: boolean) {
    setOpen(next)
    if (!next) { setQuery(''); setLimit(PAGE_SIZE) }
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger id={id} disabled={disabled} render={<Button type="button" variant="outline" className="h-9 w-full justify-between font-normal" />} aria-label={`${label}${required ? '（必填）' : ''}：${selected?.label ?? placeholder}`}>
        <span className={selected ? 'truncate' : 'truncate text-muted-foreground'}>{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className="shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] min-w-64">
        <PopoverTitle className="sr-only">選擇{label}</PopoverTitle>
        <div className="relative border-b p-3">
          <Search className="pointer-events-none absolute top-5 left-5 text-muted-foreground" size={16} />
          <Input id={searchId} aria-label={`搜尋${label}`} placeholder={`搜尋${label}…`} className="pl-8" value={query} onChange={event => {
            setQuery(event.target.value)
            setLimit(PAGE_SIZE)
            if (listRef.current) listRef.current.scrollTop = 0
          }} />
        </div>
        <div
          ref={listRef}
          className="max-h-72 overflow-y-auto p-1.5"
          onScroll={event => {
            const { scrollTop, clientHeight, scrollHeight } = event.currentTarget
            if (visible.length < matches.length && scrollHeight - scrollTop - clientHeight <= 40) {
              setLimit(Math.min(limit + PAGE_SIZE, matches.length))
            }
          }}
        >
          {visible.map(option => (
            <Button key={option.value} type="button" variant="ghost" className="h-auto min-h-9 w-full justify-between py-2 text-left font-normal whitespace-normal" aria-pressed={option.value === value} onClick={() => { onValueChange(option.value); changeOpen(false) }}>
              {option.label}
              {option.value === value && <Check className="shrink-0" aria-hidden="true" />}
            </Button>
          ))}
          {matches.length === 0 && <p className="p-5 text-center text-sm text-muted-foreground">找不到符合的資料</p>}
        </div>
        <div className="space-y-2 border-t p-3">
          <p role="status" className="text-xs text-muted-foreground">顯示 {visible.length} / {matches.length} 筆</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
