import { FilterFieldIcon, FilterValue } from '@/components/ui/filter-value'
import { defaultFieldOperator, getFieldOperators, type FilterField } from '@/lib/filter-fields'
import { useState } from 'react'
import { GripVertical, Eye, EyeOff, ArrowLeft, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverClose } from '@/components/ui/popover'
import { filterOperators, requiresFilterValue, type FilterOperator, type FilterRule } from '@/features/filters/models/advanced-filter'

export type FieldFilter = Pick<FilterRule, 'field' | 'operator' | 'value'>
interface FilterMenuProps {
  fieldOrder: number[]
  onMoveField: (source: number, target: number) => void
  fields: FilterField[]
  value: FieldFilter | null
  onChange: (filter: FieldFilter | null) => void
  hiddenFields: number[]
  onToggleVisibility: (field: number) => void
}

/** Controlled field filtering and visibility, independent of entity ViewModels. */
export function FilterMenu({ fields, value, onChange, hiddenFields, onToggleVisibility, fieldOrder, onMoveField }: FilterMenuProps) {
  const [dragged, setDragged] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState<FieldFilter | null>(null)

  function updateDraft(next: FieldFilter) {
    setDraft(next)
    onChange(requiresFilterValue(next.operator) && !next.value.trim() ? null : { ...next, value: next.value.trim() })
  }

  return (
    <Popover open={open} onOpenChange={next => { setOpen(next); if (!next) { setSearch(''); setDraft(null); setDragged(null); setDropTarget(null) } }}>
      <PopoverTrigger render={<Button variant="ghost" className="text-xs text-muted-foreground" />}>
        <SlidersHorizontal /> 篩選{value ? ' · 1' : ''}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <span role="status" className="sr-only">{announcement}</span>
        <div className="flex items-center gap-2 border-b px-3 py-2.5">
          {draft
            ? <Button variant="ghost" size="icon-sm" aria-label="返回欄位列表" onClick={() => setDraft(null)}><ArrowLeft /></Button>
            : <PopoverClose render={<Button variant="ghost" size="icon-sm" aria-label="關閉篩選" />}><X /></PopoverClose>}
          <PopoverTitle className="font-semibold">{draft ? fields[draft.field].label : '篩選'}</PopoverTitle>
        </div>
        {draft ? (
          <>
            <div className="relative border-b">
              <select
                aria-label="比較方式"
                className="h-12 w-full appearance-none bg-transparent px-4 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                value={draft.operator}
                onChange={event => updateDraft({ ...draft, operator: event.target.value as FilterOperator })}
              >
                {getFieldOperators(fields[draft.field]).map(key => <option key={key} value={key}>{filterOperators[key]}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute top-4 right-4 text-muted-foreground" />
            </div>
            {requiresFilterValue(draft.operator)
              ? <div className="p-3"><FilterValue field={fields[draft.field]} value={draft.value} onChange={next => updateDraft({ ...draft, value: next })} /></div>
              : <p className="px-4 py-5 text-sm text-muted-foreground">不需輸入值，已套用篩選。</p>}
          </>
        ) : (
          <>
            <div className="p-3"><Input aria-label="搜尋篩選欄位" placeholder="搜尋欄位" value={search} onChange={event => setSearch(event.target.value)} /></div>
            <div className="max-h-96 overflow-y-auto">
              {[false, true].map(hidden => {
                const matching = fieldOrder.map(index => ({ ...fields[index], index }))
                  .filter(field => hiddenFields.includes(field.index) === hidden && field.label.includes(search.trim()))
                return <section key={String(hidden)} aria-label={hidden ? '隱藏欄位' : '可見欄位'}>
                  <h3 className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground">{hidden ? '隱藏欄位' : '可見欄位'}</h3>
                  <div className="p-2">
                    {matching.map(({ label, hideable = true, index }) => <div key={label} className="flex items-center gap-1 rounded-md data-[target=true]:bg-blue-50 data-[target=true]:ring-1 data-[target=true]:ring-blue-300" data-target={dropTarget === index}
                      onDragOver={event => {
                        if (dragged !== null && hiddenFields.includes(dragged) === hidden) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropTarget(index) }
                      }}
                      onDrop={event => {
                        event.preventDefault()
                        if (dragged !== null && hiddenFields.includes(dragged) === hidden) {
                          onMoveField(dragged, index)
                          setAnnouncement(`已調整${fields[dragged].label}的位置`)
                        }
                        setDragged(null); setDropTarget(null)
                      }}>
                      <Button type="button" variant="ghost" size="icon-sm" className="shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" draggable
                        aria-label={`拖移${label}欄位，也可使用上下方向鍵排序`} title="拖曳排序，或使用上下方向鍵"
                        onDragStart={event => { setDragged(index); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(index)) }}
                        onDragEnd={() => { setDragged(null); setDropTarget(null) }}
                        onKeyDown={event => {
                          if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
                          event.preventDefault()
                          const position = matching.findIndex(item => item.index === index)
                          const target = matching[position + (event.key === 'ArrowUp' ? -1 : 1)]
                          if (target) { onMoveField(index, target.index); setAnnouncement(`已${event.key === 'ArrowUp' ? '上移' : '下移'}${label}`) }
                        }}><GripVertical /></Button>
                      <Button variant="ghost" className="h-11 min-w-0 flex-1 justify-start gap-3 text-muted-foreground" onClick={() => setDraft(value?.field === index ? { ...value } : { field: index, operator: defaultFieldOperator(fields[index]), value: '' })}><FilterFieldIcon field={fields[index]} />{label}</Button>
                      <Button type="button" variant="ghost" size="icon-sm" disabled={!hideable} aria-label={hideable ? `${hidden ? '顯示' : '隱藏'}${label}欄位` : `${label}欄位不可隱藏`} onClick={() => onToggleVisibility(index)}>{hidden ? <EyeOff /> : <Eye />}</Button>
                    </div>)}
                    {!matching.length && <p className="px-2 py-3 text-xs text-muted-foreground">{search.trim() ? '找不到符合的欄位' : hidden ? '目前沒有隱藏欄位' : '目前沒有可見欄位'}</p>}
                  </div>
                </section>
              })}
            </div>
            {value && <div className="border-t p-2"><Button variant="ghost" size="sm" onClick={() => onChange(null)}>清除篩選</Button></div>}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
