import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function PasswordInput({ className, ...props }: Omit<ComponentProps<typeof Input>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return <div className="relative">
    <Input {...props} type={visible ? 'text' : 'password'} className={cn('pr-10', className)} />
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute top-0 right-0 h-8 w-9 text-muted-foreground"
      aria-label={visible ? '隱藏密碼' : '顯示密碼'}
      aria-pressed={visible}
      aria-controls={props.id}
      disabled={props.disabled}
      onClick={() => setVisible(current => !current)}
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </Button>
  </div>;
}
