import type { ComponentProps, MouseEvent } from 'react';
import { navigate } from '@/lib/router';

export function AppLink({ onClick, ...props }: ComponentProps<'a'>) {
  function follow(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      (props.target && props.target !== '_self') || props.download !== undefined || !props.href) return;
    const url = new URL(props.href, window.location.href);
    if (url.origin !== window.location.origin || !['http:', 'https:'].includes(url.protocol) || url.pathname.startsWith('/api/')) return;
    event.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  }
  return <a {...props} onClick={follow} />;
}
