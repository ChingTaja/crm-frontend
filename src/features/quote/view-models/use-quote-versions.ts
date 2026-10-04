import { useAccess } from '@/features/access/view-models/use-access';
import { useRef, useState } from 'react';
import { quoteApi, cacheQuote } from '../models/quote-service';
import { useApi } from '@/hooks/use-api';
import { canManageQuote, money, quoteTotals } from '../models/quote-policy';
import type { ApprovalStatus, Quote, QuoteActor, QuoteStatus } from '../models/quote-types';

const statusLabels: Record<QuoteStatus, string> = {
  Draft: '草稿',
  Sent: '已送出',
  Accepted: '已接受',
  Rejected: '已拒絕',
  Expired: '已過期',
};
const approvalLabels: Record<ApprovalStatus, string> = {
  NotRequired: '無須審批',
  Required: '需要審批',
  Pending: '待審批',
  Approved: '已批准',
  Rejected: '審批被拒絕',
};

export function useQuoteVersions(
  quote: Quote,
  selectedId: string,
  actor: QuoteActor | null,
  dirty: boolean,
  onSelect: (id: string) => void
) {
  const { can } = useAccess();
  const request = useApi(quoteApi.newVersion);
  const busy = useRef(false);
  const [error, setError] = useState('');
  const latest = quote.versions[quote.versions.length - 1];
  const blockedReason = dirty
    ? '請先儲存或重置修改，再切換或建立版本。'
    : (!can('quotes.update') || !canManageQuote(actor))
      ? '目前身分無法建立新版本。'
      : quote.orderId || latest.status === 'Accepted'
        ? '報價已接受或已轉成訂單，無法建立新版本。'
        : latest.status === 'Draft' && latest.approval === 'Pending'
          ? '最新版本正在審批，完成審批後才能建立新版本。'
          : '';

  async function createVersion() {
    if (blockedReason || busy.current) return;
    busy.current = true;
    setError('');
    try {
      const updated = await request.execute(quote.id, latest.id, { expectedRevision: latest.revision });
      cacheQuote(updated);
      onSelect(updated.versions[updated.versions.length - 1].id);
    } catch (error) {
      setError(error instanceof Error ? error.message : '建立版本失敗。');
    } finally { busy.current = false; }
  }

  return {
    error,
    blockedReason: request.isLoading ? '建立版本中…' : blockedReason,
    canCreateVersion: can('quotes.update'),
    createVersion,
    latestNumber: latest.version,
    nextNumber: latest.version + 1,
    select: (id: string) => {
      if (!dirty && quote.versions.some((version) => version.id === id)) onSelect(id);
    },
    rows: [...quote.versions].reverse().map((version) => ({
      id: version.id,
      number: version.version,
      selected: version.id === selectedId,
      latest: version.id === latest.id,
      status: statusLabels[version.status],
      approval: approvalLabels[version.approval],
      total: money(version.totals?.totalCents ?? quoteTotals(version.lines).totalCents),
      validUntil: version.validUntil,
      createdAt: new Date(version.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      createdBy: version.createdBy,
    })),
  };
}
