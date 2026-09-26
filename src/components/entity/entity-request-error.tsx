import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';

export function EntityRequestError({ title, entity, error, retry }: {
  title: string;
  entity: string;
  error: Error;
  retry: () => void;
}) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 py-6 text-sm text-destructive">
    <span>無法載入{title}：{error.message}</span>
    <Button variant="outline" onClick={retry}>重試</Button>
    <AppLink className="underline" href={`/${entity}`}>返回列表</AppLink>
  </div>;
}
