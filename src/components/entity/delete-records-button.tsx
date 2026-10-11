import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DeleteRecordsButtonProps {
  title: string;
  records: { id: string; name: string }[];
  onDelete: () => void | string | Promise<void | string>;
  disabled?: boolean;
  includesVersions?: boolean;
  confirmationMessage?: string;
}

export function DeleteRecordsButton({
  title,
  records,
  onDelete,
  disabled,
  includesVersions,
  confirmationMessage,
}: DeleteRecordsButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const busy = useRef(false);
  async function confirm() {
    if (busy.current) return;
    busy.current = true;
    setIsDeleting(true);
    setError('');
    try {
      const result = await onDelete();
      if (result) setSummary(result);
      else setOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : '刪除失敗，請稍後重試。');
    } finally {
      busy.current = false;
      setIsDeleting(false);
    }
  }
  return (
    <>
      <Button
        type="button"
        variant="destructive"
        disabled={disabled || !records.length}
        onClick={() => {
          setError('');
          setSummary('');
          setOpen(true);
        }}
      >
        <Trash2 />
        刪除{records.length > 0 && `（${records.length}）`}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!busy.current) setOpen(next);
        }}
      >
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">刪除{title}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {summary ? (
              '刪除作業已完成，以下為逐筆結果。'
            ) : confirmationMessage ?? (includesVersions
              ? `確定刪除${records.length === 1 ? '此報價單' : `已選取的 ${records.length} 筆報價單`}及其所有版本、明細與操作紀錄？`
              : `確定刪除已選取的 ${records.length} 筆${title}？`)}
          </DialogDescription>
          <ul className="my-4 max-h-48 space-y-2 overflow-y-auto rounded-lg bg-muted/40 p-3 text-sm">
            {records.map((record) => (
              <li key={record.id} className="break-words">
                {record.name}
              </li>
            ))}
          </ul>
          {summary && (
            <p role="status" className="mb-3 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm">
              {summary}
            </p>
          )}
          {error && (
            <p role="alert" className="mb-3 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setOpen(false)}>
              {summary ? '關閉' : '取消'}
            </Button>
            {!summary && (
              <Button
                type="button"
                variant="destructive"
                disabled={disabled || !records.length || isDeleting}
                onClick={confirm}
              >
                {isDeleting ? '刪除中…' : '確認刪除'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
