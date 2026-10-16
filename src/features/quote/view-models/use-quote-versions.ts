import { useRef, useState } from 'react';
import { quoteApi, cacheQuote, refreshQuoteAfterForbidden } from '../models/quote-service';
import { useApi } from '@/hooks/use-api';
import { money } from '../models/quote-policy';
import { hasQuoteAction } from '../models/quote-permissions';
import type { ApprovalStatus, Quote, QuoteActor, QuoteStatus } from '../models/quote-types';

const statusLabels: Record<QuoteStatus, string> = {
  Draft: '草稿',
  Sent: '已送出',
  Accepted: '已接受',
  Rejected: '已拒絕',
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
  _actor: QuoteActor | null,
  dirty: boolean,
  onSelect: (id: string) => void
) {
  const request = useApi(quoteApi.newVersion);
  const busy = useRef(false);
  const [error, setError] = useState('');
  const latest = quote.versions[quote.versions.length - 1];
  const selected = quote.versions.find((version) => version.id === selectedId) ?? latest;
  const blockedReason = dirty
    ? '請先儲存或重置修改，再切換或建立版本。'
    : !hasQuoteAction(selected, 'new-version')
      ? '此版本目前無法建立新版本。'
      : '';

  async function createVersion() {
    if (blockedReason || busy.current) return;
    busy.current = true;
    setError('');
    try {
      const updated = await request.execute(quote.id, selected.id, { expectedRevision: selected.revision });
      cacheQuote(updated);
      onSelect(updated.versions[updated.versions.length - 1].id);
    } catch (error) {
      setError(error instanceof Error ? error.message : '建立版本失敗。');
      await refreshQuoteAfterForbidden(error, quote.id);
    } finally {
      busy.current = false;
    }
  }

  return {
    error,
    blockedReason: request.isLoading ? '建立版本中…' : blockedReason,
    canCreateVersion: hasQuoteAction(selected, 'new-version'),
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
      total: version.totals?.totalCents == null ? '—' : money(version.totals.totalCents, version.currency),
      createdAt: new Date(version.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      createdBy: version.createdBy,
    })),
  };
}
