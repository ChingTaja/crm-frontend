import { useAccess } from '@/features/access/view-models/use-access';
import { navigate } from '@/lib/router';
import { useRef, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { orderApi } from '@/features/order/models/order-service';
import { quoteApi, cacheQuote } from '../models/quote-service';
import { canManageQuote } from '../models/quote-policy';
import type { Quote, QuoteActor, QuoteVersion } from '../models/quote-types';

type Decision = 'approve' | 'deny' | 'accept' | 'reject';
export function useQuoteActions(quote: Quote, version: QuoteVersion, actor: QuoteActor | null) {
  const { can } = useAccess();
  const pending = useRef(false);
  const [working, setWorking] = useState(false);
  const workflow = useApi(async (signal: AbortSignal, action: 'review' | 'decision' | 'send' | 'requestApproval', decisionValue?: Decision, note?: string) => {
    const body = { expectedRevision: version.revision };
    if (action === 'review') return quoteApi.review(signal, quote.id, version.id, { ...body, decision: decisionValue === 'approve' ? 'approved' : 'rejected', reason: note });
    if (action === 'decision') return quoteApi.decision(signal, quote.id, version.id, { ...body, decision: decisionValue === 'accept' ? 'accepted' : 'rejected', reason: note });
    return quoteApi[action](signal, quote.id, version.id, body);
  });
  const conversion = useApi(orderApi.convert);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const latest = quote.versions[quote.versions.length - 1]?.id === version.id;
  const canManage = latest && canManageQuote(actor);
  const draft = version.status === 'Draft';
  const labels = { approve: '主管批准', deny: '拒絕審批', accept: '接受報價', reject: '拒絕報價' };

  async function act(action: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true; setWorking(true); setError('');
    try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : '操作失敗。'); }
    finally { pending.current = false; setWorking(false); }
  }
  function confirm() {
    void act(async () => {
      if (!decision) return;
      if ((decision === 'deny' || decision === 'reject') && !reason.trim()) throw new Error('請填寫拒絕原因。');
      const result = await workflow.execute(decision === 'approve' || decision === 'deny' ? 'review' : 'decision', decision, reason.trim());
      setDecision(null); cacheQuote(result);
    });
  }
  return {
    decision,
    reason,
    error: error || conversion.error?.message,
    isConverting: conversion.isLoading || working,
    working,
    setReason,
    confirm,
    decisionLabel: decision ? labels[decision] : '',
    needsReason: decision === 'deny' || decision === 'reject',
    open: (value: Decision) => {
      setDecision(value);
      setReason('');
      setError('');
    },
    close: () => { if (!pending.current) setDecision(null); },
    canRequest: can('quotes.update') && canManage && draft && ['Required', 'Rejected'].includes(version.approval),
    canSend: can('quotes.update') && canManage && draft && ['Approved', 'NotRequired'].includes(version.approval),
    canConvert: can('quotes.update') && canManage && version.status === 'Accepted',
    canReview: latest && can('quotes.update') && version.createdBy !== actor?.id && draft && version.approval === 'Pending',
    canDecide: latest && can('quotes.update') && version.status === 'Sent',
    requestApproval: () =>
      act(async () => { cacheQuote(await workflow.execute('requestApproval')); }),
    send: () =>
      act(async () => { cacheQuote(await workflow.execute('send')); }),
    convertToOrder: async () => {
      if (conversion.isLoading) return;
      if (quote.orderId) {
        navigate(`/orders/${quote.orderId}/edit`);
        return;
      }
      try {
        const result = await conversion.execute(quote.id, version.id, { expectedRevision: version.revision });
        navigate(`/orders/${result.orderId}/edit`);
      } catch {
        /* useApi exposes ProblemDetail messages. */
      }
    },
  };
}
