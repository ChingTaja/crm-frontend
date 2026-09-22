import { useState } from 'react'
import { quoteRepository } from '../models/quote-repository'
import { canManageQuote, money, quoteTotals } from '../models/quote-policy'
import type { ApprovalStatus, Quote, QuoteActor, QuoteStatus } from '../models/quote-types'

const statusLabels: Record<QuoteStatus, string> = {
  Draft: '草稿', Sent: '已送出', Accepted: '已接受', Rejected: '已拒絕', Expired: '已過期',
}
const approvalLabels: Record<ApprovalStatus, string> = {
  NotRequired: '無須審批', Required: '需要審批', Pending: '待審批', Approved: '已批准', Rejected: '審批被拒絕',
}

export function useQuoteVersions(quote: Quote, selectedId: string, actor: QuoteActor | null, dirty: boolean, onSelect: (id: string) => void) {
  const [error, setError] = useState('')
  const latest = quote.versions[quote.versions.length - 1]
  const blockedReason = dirty ? '請先儲存或重置修改，再切換或建立版本。'
    : !canManageQuote(actor) ? '目前身分無法建立新版本。'
    : quote.orderId || latest.status === 'Accepted' ? '報價已接受或已轉成訂單，無法建立新版本。'
    : latest.status === 'Draft' && latest.approval === 'Pending' ? '最新版本正在審批，完成審批後才能建立新版本。'
    : ''

  function createVersion() {
    if (blockedReason) return
    setError('')
    try {
      const updated = quoteRepository.newVersion(quote.id, latest.id, actor)
      onSelect(updated.versions[updated.versions.length - 1].id)
    } catch (error) {
      setError(error instanceof Error ? error.message : '建立版本失敗。')
    }
  }

  return {
    error, blockedReason, createVersion, latestNumber: latest.version, nextNumber: latest.version + 1,
    select: (id: string) => { if (!dirty && quote.versions.some(version => version.id === id)) onSelect(id) },
    rows: [...quote.versions].reverse().map(version => ({
      id: version.id, number: version.version, selected: version.id === selectedId,
      latest: version.id === latest.id, status: statusLabels[version.status], approval: approvalLabels[version.approval],
      total: money(quoteTotals(version.lines).totalCents), validUntil: version.validUntil,
      createdAt: new Date(version.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      createdBy: version.createdBy,
    })),
  }
}
