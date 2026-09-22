import { useState } from 'react'
import { quoteRepository } from '../models/quote-repository'
import { canManageQuote } from '../models/quote-policy'
import type { Quote, QuoteActor, QuoteVersion } from '../models/quote-types'

type Decision = 'approve' | 'deny' | 'accept' | 'reject'
export function useQuoteActions(quote: Quote, version: QuoteVersion, actor: QuoteActor | null) {
  const [decision, setDecision] = useState<Decision | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const latest = quote.versions[quote.versions.length - 1]?.id === version.id
  const canManage = latest && canManageQuote(actor)
  const draft = version.status === 'Draft'
  const labels = { approve: '主管批准', deny: '拒絕審批', accept: '接受報價', reject: '拒絕報價' }

  function act(action: () => void) {
    setError('')
    try { action() } catch (error) { setError(error instanceof Error ? error.message : '操作失敗。') }
  }
  function confirm() {
    act(() => {
      if (decision === 'approve' || decision === 'deny') {
        if (!actor) throw new Error('審批需要主管身分。')
        quoteRepository.review(quote.id, version.id, decision === 'approve', reason, actor)
      }
      if (decision === 'accept' || decision === 'reject') {
        if (!actor) throw new Error('接受或拒絕報價需要客戶身分。')
        quoteRepository.decide(quote.id, version.id, decision === 'accept', reason, actor)
      }
      setDecision(null)
    })
  }
  return {
    decision, reason, error, setReason, confirm,
    decisionLabel: decision ? labels[decision] : '',
    needsReason: decision === 'deny' || decision === 'reject',
    open: (value: Decision) => { setDecision(value); setReason(''); setError('') },
    close: () => setDecision(null),
    canRequest: canManage && draft && ['Required', 'Rejected'].includes(version.approval),
    canSend: canManage && draft && ['Approved', 'NotRequired'].includes(version.approval),
    canConvert: canManage && version.status === 'Accepted',
    canReview: latest && actor?.role === 'manager' && draft && version.approval === 'Pending',
    canDecide: latest && actor?.role === 'customer' && version.status === 'Sent',
    requestApproval: () => act(() => { quoteRepository.requestApproval(quote.id, version.id, actor) }),
    send: () => act(() => { quoteRepository.send(quote.id, version.id, actor) }),
    convertToOrder: () => act(() => {
      const id = quoteRepository.convertToOrder(quote.id, version.id, actor)
      window.location.hash = `/orders/${id}/edit`
    }),
  }
}
