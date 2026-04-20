'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'motion/react'
import BlurText from '@/components/ui/BlurText'
import CountUp from '@/components/ui/CountUp'
import { SpendTrendChart } from '@/components/charts/SpendTrendChart'
import { NewVsExistingChart } from '@/components/charts/NewVsExistingChart'
import { OnOffComparisonChart } from '@/components/charts/OnOffComparisonChart'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'
import { FadeIn, StaggerList, StaggerItem, ScaleIn, AnimatedLine } from '@/components/motion'
import { YonderLogo } from '@/components/brand/YonderLogo'
import type { PartnerSummaryMetrics } from '@/lib/types'

interface Props {
  summary: PartnerSummaryMetrics
}

/* ── Formatters ──────────────────────────────────────────────── */

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`
  return `£${n.toFixed(0)}`
}

/* ── Easing ──────────────────────────────────────────────────── */

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ═══════════════════════════════════════════════════════════════ */
/*  Main component                                               */
/* ═══════════════════════════════════════════════════════════════ */

export function PartnerFacingClient({ summary }: Props) {
  const config = PARTNER_CONFIGS.find(c => c.partner_name === summary.partner_name)
  const token = config?.partner_token ?? ''

  const repeatRate = summary.total_transactions > 0
    ? (summary.repeat_transactions / summary.total_transactions) * 100
    : 0

  const avgTxn = summary.total_transactions > 0
    ? summary.total_spend_gbp / summary.total_transactions
    : 0

  const hasOnOff = summary.on_months_count > 0 && summary.off_months_count > 0
  const incrementalPositive = summary.incremental_spend > 0
  const activeMonthCount = summary.on_months_count
  const inactiveMonthCount = summary.off_months_count

  const upliftPct = summary.avg_monthly_off_spend > 0
    ? ((summary.avg_monthly_on_spend - summary.avg_monthly_off_spend) / summary.avg_monthly_off_spend) * 100
    : 0

  /* Hero parallax */
  const heroRef = useRef(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(heroProgress, [0, 1], [0, 140])
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0])

  /* Scroll progress bar */
  const { scrollYProgress: pageProgress } = useScroll()

  return (
    <main className="bg-white overflow-x-hidden">
      {/* ── Scroll progress ──────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-coral to-coral-light origin-left z-50 no-print"
        style={{ scaleX: pageProgress }}
      />

      {/* ═════════════════════════════════════════════════════ */}
      {/*  HERO — Full viewport, partner name + context        */}
      {/* ═════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 bg-sand-50 noise"
      >
        {/* Floating brand */}
        <div className="absolute top-6 left-6 z-10">
          <YonderLogo variant="dark" size="sm" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center max-w-3xl relative z-10"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="text-[11px] font-semibold text-ink-300 uppercase tracking-caps mb-6"
          >
            Rewards Partnership Report · {summary.period_label}
          </motion.p>

          <BlurText
            text={summary.display_name}
            className="text-[clamp(3rem,8vw,6rem)] font-display font-semibold text-ink-900 leading-[0.92] tracking-display justify-center mb-8"
            animateBy="words"
            direction="top"
            delay={120}
            stepDuration={0.3}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease }}
            className="text-lg md:text-xl text-ink-400 leading-relaxed mx-auto max-w-xl"
          >
            Here&apos;s how your customers engaged with {summary.display_name} through the Yonder rewards programme.
          </motion.p>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-10 flex flex-col items-center gap-2 no-print"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <span className="text-[10px] text-ink-200 uppercase tracking-caps">Scroll to explore</span>
          <motion.svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            className="text-ink-200"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>
      </section>

      {/* ═════════════════════════════════════════════════════ */}
      {/*  YOUR PARTNERSHIP AT A GLANCE                        */}
      {/* ═════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">At a glance</p>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-display font-semibold text-ink-900 tracking-display leading-snug max-w-lg mx-auto">
              Your Yonder partnership,{' '}
              <span className="text-ink-300">by the numbers</span>
            </h2>
          </FadeIn>

          <StaggerList className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StaggerItem>
              <div className="bg-sand-50 rounded-2xl border border-sand-200 p-5 md:p-6 text-center hover:shadow-float hover:-translate-y-0.5 transition-all duration-400">
                <p className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  {summary.total_spend_gbp >= 1000 ? (
                    <>£<CountUp to={parseFloat((summary.total_spend_gbp / 1000).toFixed(1))} from={0} duration={2.2} />k</>
                  ) : (
                    <>£<CountUp to={Math.round(summary.total_spend_gbp)} from={0} duration={2.2} separator="," /></>
                  )}
                </p>
                <p className="text-sm font-medium text-ink-600 mb-1">Total customer spend</p>
                <p className="text-xs text-ink-300 leading-relaxed">from Yonder members at your venue</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="bg-sand-50 rounded-2xl border border-sand-200 p-5 md:p-6 text-center hover:shadow-float hover:-translate-y-0.5 transition-all duration-400">
                <p className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  <CountUp to={summary.new_users} from={0} duration={2.2} separator="," />
                </p>
                <p className="text-sm font-medium text-ink-600 mb-1">New customers</p>
                <p className="text-xs text-ink-300 leading-relaxed">visited for the first time via Yonder</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="bg-sand-50 rounded-2xl border border-sand-200 p-5 md:p-6 text-center hover:shadow-float hover:-translate-y-0.5 transition-all duration-400">
                <p className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  <CountUp to={summary.total_transactions} from={0} duration={2.2} separator="," />
                </p>
                <p className="text-sm font-medium text-ink-600 mb-1">Total visits</p>
                <p className="text-xs text-ink-300 leading-relaxed">avg. {fmt(avgTxn)} per transaction</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="bg-sand-50 rounded-2xl border border-sand-200 p-5 md:p-6 text-center hover:shadow-float hover:-translate-y-0.5 transition-all duration-400">
                <p className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  <CountUp to={Math.round(repeatRate)} from={0} duration={2.2} />%
                </p>
                <p className="text-sm font-medium text-ink-600 mb-1">Came back again</p>
                <p className="text-xs text-ink-300 leading-relaxed">of all visits were returning customers</p>
              </div>
            </StaggerItem>
          </StaggerList>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════ */}
      {/*  THE REWARDS EFFECT — On/Off Yonder comparison       */}
      {/* ═════════════════════════════════════════════════════ */}
      {hasOnOff && (
        <section className="py-28 md:py-40 bg-sand-50">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-10">
              <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">The rewards effect</p>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-display font-semibold text-ink-900 tracking-display leading-snug max-w-xl mx-auto">
                When your rewards are live, your customers spend more
              </h2>
            </FadeIn>

            <FadeIn delay={0.1} className="text-center mb-16">
              <p className="text-base text-ink-400 max-w-md mx-auto leading-relaxed">
                During the {activeMonthCount} months {summary.display_name} was featured on Yonder,
                customers spent significantly more than during the {inactiveMonthCount} inactive months.
              </p>
            </FadeIn>

            {/* Dramatic uplift number */}
            <FadeIn className="text-center mb-16">
              <div className="inline-block">
                <p className={`text-[clamp(4rem,12vw,8rem)] font-display font-semibold tracking-tighter leading-none ${
                  incrementalPositive ? 'text-gradient-coral' : 'text-ink-200'
                }`}>
                  {incrementalPositive ? '+' : ''}
                  <CountUp to={Math.round(summary.incremental_spend)} from={0} duration={2.5} separator="," />
                </p>
                <AnimatedLine className="mt-2 !bg-coral" />
              </div>
              <p className="text-base text-ink-400 mt-5 max-w-sm mx-auto leading-relaxed">
                {incrementalPositive
                  ? 'additional spend when your rewards were active on Yonder compared to when they weren\'t'
                  : 'difference in spend between active and inactive reward periods'}
              </p>
              {upliftPct > 0 && (
                <motion.p
                  className="text-sm font-semibold text-coral mt-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 }}
                >
                  That&apos;s a {Math.round(upliftPct)}% uplift
                </motion.p>
              )}
            </FadeIn>

            {/* On vs Off comparison cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <ScaleIn delay={0}>
                <div className="rounded-2xl bg-coral-50/60 border border-coral-100 px-6 py-6 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-40" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-coral" />
                    </span>
                    <span className="text-[11px] font-semibold text-coral uppercase tracking-caps">Rewards live</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-semibold text-ink-900 font-tabular tracking-tight">{fmt(summary.avg_monthly_on_spend)}</p>
                  <p className="text-xs text-ink-400 mt-1.5">avg. monthly spend · {activeMonthCount} months</p>
                </div>
              </ScaleIn>
              <ScaleIn delay={0.1}>
                <div className="rounded-2xl bg-sand-100 border border-sand-200 px-6 py-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-ink-200" />
                    <span className="text-[11px] font-semibold text-ink-300 uppercase tracking-caps">Rewards off</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-semibold text-ink-900 font-tabular tracking-tight">{fmt(summary.avg_monthly_off_spend)}</p>
                  <p className="text-xs text-ink-300 mt-1.5">avg. monthly spend · {inactiveMonthCount} months</p>
                </div>
              </ScaleIn>
            </div>

            {/* Explanation */}
            <FadeIn delay={0.15} className="mb-12">
              <div className="glass rounded-2xl px-6 py-5 border border-gray-200/60">
                <p className="text-sm text-ink-400 leading-relaxed">
                  <span className="font-semibold text-ink-600">How this works: </span>
                  Yonder members can redeem points at your venue during active reward periods. We compare total
                  customer spend during these periods against months when your rewards weren&apos;t featured,
                  to measure the incremental value the partnership delivers.
                </p>
              </div>
            </FadeIn>

            {/* Monthly chart */}
            <FadeIn>
              <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-card">
                <p className="text-sm font-semibold text-ink-700 mb-1">Monthly spend breakdown</p>
                <p className="text-xs text-ink-300 mb-5">
                  Coral bars show months when your rewards were active on Yonder
                </p>
                <OnOffComparisonChart data={summary.monthly_breakdown} />
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════ */}
      {/*  NEW CUSTOMERS                                       */}
      {/* ═════════════════════════════════════════════════════ */}
      <section className={`py-28 md:py-40 ${hasOnOff ? 'bg-white' : 'bg-sand-50'}`}>
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">Customer acquisition</p>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-display font-semibold text-ink-900 tracking-display leading-snug max-w-xl mx-auto">
              Yonder brought <span className="text-coral">{summary.new_users.toLocaleString()}</span> new customers to your door
            </h2>
          </FadeIn>

          <FadeIn delay={0.1} className="text-center mb-16">
            <p className="text-base text-ink-400 max-w-lg mx-auto leading-relaxed">
              These are Yonder members who had never visited {summary.display_name} before.
              They discovered you through the Yonder rewards programme — and
              {repeatRate > 30 ? ' many came back for more.' : ' some are already returning.'}
            </p>
          </FadeIn>

          <div className="grid grid-cols-3 gap-4 mb-16">
            <ScaleIn delay={0}>
              <div className="bg-sand-50 rounded-2xl border border-sand-200 p-5 text-center hover:shadow-float hover:-translate-y-0.5 transition-all duration-400">
                <p className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  <CountUp to={summary.new_users} from={0} duration={2} separator="," />
                </p>
                <p className="text-xs font-medium text-ink-600">First-time visitors</p>
                <p className="text-[11px] text-ink-300 mt-1">{fmt(summary.new_spend_gbp)} total spend</p>
              </div>
            </ScaleIn>
            <ScaleIn delay={0.1}>
              <div className="bg-sand-50 rounded-2xl border border-sand-200 p-5 text-center hover:shadow-float hover:-translate-y-0.5 transition-all duration-400">
                <p className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  <CountUp to={Math.round(repeatRate)} from={0} duration={2} /><span>%</span>
                </p>
                <p className="text-xs font-medium text-ink-600">Repeat rate</p>
                <p className="text-[11px] text-ink-300 mt-1">came back for another visit</p>
              </div>
            </ScaleIn>
            <ScaleIn delay={0.2}>
              <div className="bg-sand-50 rounded-2xl border border-sand-200 p-5 text-center hover:shadow-float hover:-translate-y-0.5 transition-all duration-400">
                <p className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  <CountUp to={summary.unique_users} from={0} duration={2} separator="," />
                </p>
                <p className="text-xs font-medium text-ink-600">Total unique visitors</p>
                <p className="text-[11px] text-ink-300 mt-1">across the whole period</p>
              </div>
            </ScaleIn>
          </div>

          {/* New vs repeat chart */}
          <FadeIn>
            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-card">
              <p className="text-sm font-semibold text-ink-700 mb-1">New vs returning customer spend</p>
              <p className="text-xs text-ink-300 mb-5">
                First-time visitors are shown in coral. Returning customers in grey — a sign of loyalty.
              </p>
              <NewVsExistingChart data={summary.monthly_breakdown} metric="spend" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════ */}
      {/*  BOOST PERIODS (if applicable)                       */}
      {/* ═════════════════════════════════════════════════════ */}
      {summary.boost_transactions > 0 && (
        <section className="py-28 md:py-40 bg-sand-50">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">Reward boosts</p>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-display font-semibold text-ink-900 tracking-display leading-snug max-w-xl mx-auto">
                Time-limited boosts drove additional engagement
              </h2>
            </FadeIn>

            <FadeIn delay={0.1} className="text-center mb-12">
              <p className="text-base text-ink-400 max-w-lg mx-auto leading-relaxed">
                During special promotional windows, Yonder featured enhanced rewards for {summary.display_name}.
                These time-limited boosts drove measurable spikes in customer activity.
              </p>
            </FadeIn>

            <StaggerList className="grid grid-cols-2 gap-4 text-center">
              <StaggerItem>
                <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-card">
                  <p className="text-2xl font-semibold text-ink-900 font-tabular tracking-tight">
                    <CountUp to={summary.boost_transactions} from={0} duration={2} separator="," />
                  </p>
                  <p className="text-xs text-ink-400 mt-1">boost visits</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-card">
                  <p className="text-2xl font-semibold text-ink-900 font-tabular tracking-tight">{fmt(summary.boost_spend_gbp)}</p>
                  <p className="text-xs text-ink-400 mt-1">boost spend</p>
                </div>
              </StaggerItem>
            </StaggerList>
          </div>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════ */}
      {/*  SPEND OVER TIME (for partners without on/off data)  */}
      {/* ═════════════════════════════════════════════════════ */}
      {!hasOnOff && (
        <section className="py-28 md:py-40 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">Performance</p>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-display font-semibold text-ink-900 tracking-display">
                How spend grew over time
              </h2>
            </FadeIn>
            <FadeIn>
              <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-card">
                <p className="text-sm font-semibold text-ink-700 mb-1">Monthly Yonder member spend</p>
                <p className="text-xs text-ink-300 mb-5">
                  Showing total spend from Yonder cardholders at {summary.display_name} each month
                </p>
                <SpendTrendChart data={summary.monthly_breakdown} metric="spend" />
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════ */}
      {/*  KEY TAKEAWAYS                                       */}
      {/* ═════════════════════════════════════════════════════ */}
      {summary.insights.length > 0 && (
        <section className={`py-28 md:py-40 ${!hasOnOff ? 'bg-sand-50' : summary.boost_transactions > 0 ? 'bg-white' : 'bg-sand-50'}`}>
          <div className="max-w-2xl mx-auto px-6">
            <FadeIn className="text-center mb-14">
              <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">Key takeaways</p>
              <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-display font-semibold text-ink-900 tracking-display">
                What this means for {summary.display_name}
              </h2>
            </FadeIn>

            <StaggerList className="space-y-4">
              {summary.insights.map((insight, i) => (
                <StaggerItem key={i}>
                  <div className="flex gap-4 items-start bg-white rounded-2xl border border-gray-200/60 px-6 py-5 shadow-card hover:shadow-float transition-shadow duration-400">
                    <div className="w-7 h-7 rounded-full bg-coral-50 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-coral text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-[15px] text-ink-500 leading-relaxed">{insight}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════ */}
      {/*  CTA — Dark section with ambient gradient            */}
      {/* ═════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-40 bg-ink-950 relative overflow-hidden no-print">
        {/* Ambient gradient orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-coral/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-coral/3 blur-[100px] pointer-events-none" />

        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <FadeIn>
            <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-caps mb-6">Full details</p>
            <h2 className="text-[clamp(1.6rem,4vw,2.5rem)] font-display font-semibold text-white tracking-display mb-4">
              Ready for the complete picture?
            </h2>
            <p className="text-ink-400 leading-relaxed mb-10 max-w-md mx-auto">
              The full report includes monthly breakdowns, methodology notes, and detailed transaction data.
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Link
                href={`/report/${token}`}
                className="inline-flex items-center gap-2.5 bg-coral text-white font-semibold text-[15px] px-8 py-4 rounded-xl
                  hover:bg-coral-light hover:shadow-glow-coral transition-all duration-400"
              >
                View full report
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M3 7.5h9m0 0L8.5 4m3.5 3.5L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <div className="py-6 px-6 bg-ink-950 border-t border-white/[0.06] no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <YonderLogo variant="light" size="sm" showWordmark={false} />
          <div className="flex items-center gap-4 text-[11px] text-ink-500">
            <span>Powered by Yonder</span>
            <span className="text-ink-700">·</span>
            <span>Confidential</span>
            <span className="text-ink-700">·</span>
            <span>{summary.period_label}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
