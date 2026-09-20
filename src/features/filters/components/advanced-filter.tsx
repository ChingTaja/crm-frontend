import { useState, type ComponentProps } from 'react';
import { Filter, Plus, CopyPlus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterFieldIcon, FilterValue } from '@/components/ui/filter-value';
import { defaultFieldOperator, getFieldOperators, type FilterField } from '@/lib/filter-fields';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverClose } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  createFilterGroup,
  createFilterRule,
  countFilterRules,
  filterOperators,
  isFilterComplete,
  requiresFilterValue,
  type FilterGroup,
  type FilterNode,
  type FilterOperator,
} from '../models/advanced-filter';

function FilterSelect({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      {...props}
    />
  );
}

function RuleGroupEditor({
  group,
  fields,
  onChange,
  depth = 0,
}: {
  group: FilterGroup;
  fields: FilterField[];
  onChange: (group: FilterGroup) => void;
  depth?: number;
}) {
  function updateChild(id: string, child: FilterNode) {
    onChange({ ...group, children: group.children.map((item) => (item.id === id ? child : item)) });
  }

  return (
    <div className={cn('space-y-3', depth > 0 && 'rounded-lg border bg-muted/20 p-3')}>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>其中</span>
        <FilterSelect
          aria-label="規則群組符合方式"
          value={group.match}
          onChange={(event) => onChange({ ...group, match: event.target.value as FilterGroup['match'] })}
        >
          <option value="all">全部符合（AND）</option>
          <option value="any">任一符合（OR）</option>
        </FilterSelect>
      </div>
      {group.children.map((child) => (
        <div key={child.id} className="flex items-start gap-2">
          {child.kind === 'group' ? (
            <div className="min-w-0 flex-1">
              <RuleGroupEditor
                group={child}
                fields={fields}
                depth={depth + 1}
                onChange={(updated) => updateChild(child.id, updated)}
              />
            </div>
          ) : (
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_140px_minmax(0,1.5fr)]">
              <div className="flex min-w-0 items-center gap-2">
                <FilterFieldIcon field={fields[child.field]} />
                <FilterSelect
                  className="w-full"
                  aria-label="篩選欄位"
                  value={child.field}
                  onChange={(event) => {
                    const field = Number(event.target.value);
                    updateChild(child.id, {
                      ...child,
                      field,
                      operator: defaultFieldOperator(fields[field]),
                      value: '',
                    });
                  }}
                >
                  {fields.map((field, index) => (
                    <option key={field.label} value={index}>
                      {field.label}
                    </option>
                  ))}
                </FilterSelect>
              </div>
              <FilterSelect
                aria-label="比較方式"
                value={child.operator}
                onChange={(event) =>
                  updateChild(child.id, { ...child, operator: event.target.value as FilterOperator })
                }
              >
                {getFieldOperators(fields[child.field]).map((key) => (
                  <option key={key} value={key}>
                    {filterOperators[key]}
                  </option>
                ))}
              </FilterSelect>
              {requiresFilterValue(child.operator) ? (
                <FilterValue
                  field={fields[child.field]}
                  value={child.value}
                  onChange={(value) => updateChild(child.id, { ...child, value })}
                />
              ) : (
                <span className="self-center text-xs text-muted-foreground">不需輸入值</span>
              )}
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={child.kind === 'group' ? '刪除規則群組' : '刪除規則'}
            onClick={() => onChange({ ...group, children: group.children.filter((item) => item.id !== child.id) })}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...group, children: [...group.children, createFilterRule()] })}
        >
          <Plus />
          新增篩選規則
        </Button>
        {depth < 2 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({
                ...group,
                children: [...group.children, { ...createFilterGroup(), children: [createFilterRule()] }],
              })
            }
          >
            <CopyPlus />
            新增規則群組
          </Button>
        )}
      </div>
    </div>
  );
}

interface AdvancedFilterProps {
  fields: FilterField[];
  value: FilterGroup;
  onChange: (value: FilterGroup) => void;
}

export function AdvancedFilter({ fields, value, onChange }: AdvancedFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  const count = countFilterRules(value);
  function changeOpen(next: boolean) {
    if (next) {
      setDraft(count ? structuredClone(value) : { ...createFilterGroup(), children: [createFilterRule()] });
      setError('');
    }
    setOpen(next);
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={changeOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className={cn('text-xs text-muted-foreground', count > 0 && 'bg-blue-50 text-blue-600 hover:bg-blue-100')}
            />
          }
        >
          <Filter />
          {count ? `${count} 條進階規則` : '進階篩選'}
        </PopoverTrigger>
        <PopoverContent className="w-[850px]">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <PopoverTitle className="text-sm font-semibold">進階篩選</PopoverTitle>
            <PopoverClose render={<Button variant="ghost" size="icon-sm" aria-label="關閉進階篩選" />}>
              <X />
            </PopoverClose>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4">
            <RuleGroupEditor
              fields={fields}
              group={draft}
              onChange={(next) => {
                setDraft(next);
                setError('');
              }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3">
            <Button
              variant="ghost"
              onClick={() => {
                onChange(createFilterGroup());
                setOpen(false);
              }}
            >
              清除全部
            </Button>
            <span role="status" className="text-xs text-destructive">
              {error}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button
                onClick={() => {
                  if (draft.children.length > 0 && !isFilterComplete(draft)) {
                    setError('請填寫所有規則的值，並移除空白群組。');
                    return;
                  }
                  onChange(draft);
                  setOpen(false);
                }}
              >
                套用篩選
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {count > 0 && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="清除所有進階規則"
          onClick={() => onChange(createFilterGroup())}
        >
          <X />
        </Button>
      )}
    </div>
  );
}
