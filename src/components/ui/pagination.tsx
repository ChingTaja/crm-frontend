import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPaginationPages } from './pagination-pages';

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  const pages = getPaginationPages(page, pageCount);

  return (
    <nav aria-label="列表分頁" className="max-w-full justify-self-center">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="上一頁"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft />
          </Button>
        </li>
        {pages.map((value, index) => {
          const isBackward = value < page;
          const jumpPage = Math.max(1, Math.min(pageCount, page + (isBackward ? -10 : 10)));
          const jumpLabel = `${isBackward ? '向前' : '向後'}跳 10 頁，前往第 ${jumpPage} 頁`;

          return (
            <li key={value} className="flex items-center gap-1">
              {index > 0 && value - pages[index - 1] > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={jumpLabel}
                  title={jumpLabel}
                  onClick={() => onPageChange(jumpPage)}
                >
                  <Ellipsis size={16} aria-hidden="true" />
                </Button>
              )}
              <Button
                type="button"
                variant={value === page ? 'outline' : 'ghost'}
                size="icon-sm"
                aria-label={`第 ${value} 頁`}
                aria-current={value === page ? 'page' : undefined}
                onClick={() => onPageChange(value)}
              >
                {value}
              </Button>
            </li>
          );
        })}
        <li>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="下一頁"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight />
          </Button>
        </li>
      </ul>
    </nav>
  );
}
