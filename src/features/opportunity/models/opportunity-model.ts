import { createRepository } from '../../../lib/in-memory-repository'
export const opportunityStages = ['需求確認', '提案報價', '協商中', '已成交', '已失單'] as const
export interface Opportunity {
  id: string
  name: string
  customerId: string
  leadId: string
  amount: number
  expectedCloseDate: string
  owner: string
  stage: typeof opportunityStages[number]
}

export const opportunityRepository = createRepository<Opportunity>(Array.from({ length: 15 }, (_, index) => ({
  id: `opportunity-${index + 1}`, name: `年度合作方案 ${index + 1}`, customerId: `c${index + 1}`, leadId: `lead-${index + 1}`,
  amount: (index + 1) * 10000, expectedCloseDate: '2026-12-31', owner: ['林雅婷', '陳柏宇', '王怡安'][index % 3],
  stage: opportunityStages[index % opportunityStages.length],
})))

