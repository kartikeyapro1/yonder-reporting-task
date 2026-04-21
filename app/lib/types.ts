/**
 * lib/types.ts — re-export shim
 *
 * Types have been split into lib/types/ sub-modules.
 * This file re-exports everything so existing imports (`@/lib/types`) continue to work.
 *
 * Prefer importing from the specific sub-module in new code:
 *   import type { PartnerConfig } from '@/lib/types/config'
 */
export type {
  RawTransaction,
  RawExperienceVisited,
  CleanTransaction,
  PartnerUserFirstSeen,
  CommercialModelType,
  CommercialModel,
  PartnerActivePeriod,
  PartnerConfig,
  PartnerTransactionFact,
  PartnerMonthlyMetrics,
  PartnerSummaryMetrics,
  InternalDashboardRow,
} from '@/lib/types/index'
