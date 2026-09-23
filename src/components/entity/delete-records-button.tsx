import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface DeleteRecordsButtonProps {
  title: string
  records: { id: string; name: string }[]
  onDelete: () => void | Promise<void>
  disabled?: boolean
  includesVersions?: boolean
}

export function DeleteRecordsButton({ title, records, onDelete, disabled, includesVersions }: DeleteRecordsButtonProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const busy = useRef(false)
  async function confirm() {
    if (busy.current) return
    busy.current = true
    setIsDeleting(true)
    setError('')
    try {
      await onDelete()
      setOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : '刪除失敗，請稍後重試。')
    } finally {
      busy.current = false
      setIsDeleting(false)
    }
  }
  return <>
    <Button type="button" variant="destructive" disabled={disabled || !records.length} onClick={() => { setError(''); setOpen(true) }}>
      <Trash2 />刪除{records.length > 0 && `（${records.length}）`}
    </Button>
    <Dialog open={open} onOpenChange={next => { if (!busy.current) setOpen(next) }}>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">刪除{title}</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-muted-foreground">
          確定刪除已選取的 {records.length} 筆{title}{includesVersions ? '及其所有版本與操作紀錄' : ''}？其他關聯資料不會一起刪除。
        </DialogDescription>
        <ul className="my-4 max-h-48 space-y-2 overflow-y-auto rounded-lg bg-muted/40 p-3 text-sm">
          {records.map(record => <li key={record.id} className="break-words">{record.name}</li>)}
        </ul>
        {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setOpen(false)}>取消</Button>
          <Button type="button" variant="destructive" disabled={disabled || !records.length || isDeleting} onClick={confirm}>{isDeleting ? '刪除中…' : '確認刪除'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </>
}
