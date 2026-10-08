import { useAccess } from '@/features/access/view-models/use-access';
import type { ReactNode, FormEventHandler } from 'react';
import { ArrowLeft, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EntityPageHeader, EntityPageTitle } from '@/components/layout/entity-page-header';

interface EntityEditLayoutProps {
  title: string;
  isNew: boolean;
  readOnly?: boolean;
  formId: string;
  form: {
    back: () => void;
    reset: () => void;
    save: FormEventHandler<HTMLFormElement>;
    error: string;
    isSaving?: boolean;
  };
  headingAction?: ReactNode;
  notice?: ReactNode;
  children: ReactNode;
  dataNotice?: string | null;
}
export function EntityEditLayout({
  title,
  isNew,
  readOnly = false,
  formId,
  form,
  headingAction,
  notice,
  children,
  dataNotice = '前端示範資料，重新整理會還原。',
}: EntityEditLayoutProps) {
  const { can } = useAccess();
  const entity = formId.replace(/-form$/, '');
  const editable = !readOnly && can(
    `${entity === 'opportunity' ? 'opportunities' : entity === 'company' ? 'customers' : entity + 's'}.${isNew ? 'create' : 'update'}`
  );
  return (
    <>
      <EntityPageHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="返回列表" disabled={form.isSaving} onClick={form.back}>
            <ArrowLeft />
          </Button>
          <EntityPageTitle>
            {isNew ? '新增' : editable ? '編輯' : '查看'}
            {title}
          </EntityPageTitle>
          {headingAction}
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            disabled={form.isSaving}
            onClick={form.back}
          >
            {editable ? '取消' : '返回列表'}
          </Button>
          {editable && <><Button variant="outline" disabled={form.isSaving} onClick={form.reset}>
            <RotateCcw />
            重置
          </Button>
          <Button type="submit" form={formId} disabled={form.isSaving || !editable}>
            <Save />
            {form.isSaving ? '儲存中…' : '儲存'}
          </Button></>}
        </div>
      </EntityPageHeader>
      {notice}
      <form
        id={formId}
        onSubmit={(event) => {
          if (editable) form.save(event);
          else event.preventDefault();
        }}
        aria-busy={form.isSaving}
        className="mx-auto max-w-5xl space-y-6 py-8"
      >
        <fieldset disabled={form.isSaving || !editable} className="space-y-6">
          {children}
        </fieldset>
        <p role="status" className="text-sm text-destructive">
          {form.error}
        </p>
        {dataNotice && <p className="text-xs text-muted-foreground">{dataNotice}</p>}
      </form>
    </>
  );
}
