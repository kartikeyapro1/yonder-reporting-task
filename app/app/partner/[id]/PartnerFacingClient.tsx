'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView, useMotionValueEvent, AnimatePresence } from 'motion/react'
import BlurText from '@/components/ui/BlurText'
import CountUp from '@/components/ui/CountUp'
import { SpendTrendChart } from '@/components/charts/SpendTrendChart'
import { NewVsExistingChart } from '@/components/charts/NewVsExistingChart'
import { OnOffComparisonChart } from '@/components/charts/OnOffComparisonChart'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'
import { FadeIn, StaggerList, StaggerItem, ScaleIn, AnimatedLine, SplitHeading, FloatCard } from '@/components/motion'
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

/* ── Section progress dot ────────────────────────────────────── */

function SectionDot({ active }: { active: boolean }) {
  return (
    <motion.div
      animate={{ scale: active ? 1 : 0.6, opacity: active ? 1 : 0.35 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className={`w-2 h-2 rounded-full transition-colors duration-300 ${active ? 'bg-coral' : 'bg-ink-300'}`}
    />
  )
}

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

  /* Section refs for progress dots */
  const sec0Ref = useRef(null)
  const sec1Ref = useRef(null)
  const sec2Ref = useRef(null)
  const sec3Ref = useRef(null)
  const sec4Ref = useRef(null)
  const sec5Ref = useRef(null)

  /* Insights sticky-scroll */
  const insightRef = useRef<HTMLDivElement>(null)
  const [activeInsight, setActiveInsight] = useState(0)
  const { scrollYProgress: insightsY } = useScroll({
    target: insightRef,
    offset: ['start start', 'end end'],
  })
  useMotionValueEvent(insightsY, 'change', (v) => {
    const n = summary.insights.length
    if (n === 0) return
    const idx = Math.min(n - 1, Math.floor(v * n + 0.01))
    setActiveInsight(Math.max(0, idx))
  })

  const sec0 = useInView(sec0Ref, { margin: '-40% 0px -40% 0px' })
  const sec1 = useInView(sec1Ref, { margin: '-40% 0px -40% 0px' })
  const sec2 = useInView(sec2Ref, { margin: '-40% 0px -40% 0px' })
  const sec3 = useInView(sec3Ref, { margin: '-40% 0px -40% 0px' })
  const sec4 = useInView(sec4Ref, { margin: '-40% 0px -40% 0px' })
  const sec5 = useInView(sec5Ref, { margin: '-40% 0px -40% 0px' })

  const sections = [sec0, sec1, sec2, sec3, sec4, sec5]

  return (
    <main className="bg-white overflow-x-hidden">
      {/* ── Scroll progress bar ──────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-coral to-coral-light origin-left z-50 no-print"
        style={{ scaleX: pageProgress }}
      />

      {/* ── Section progress dots ─────────────────────────────── */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 no-print hidden md:flex">
        {sections.map((active, i) => (
          <SectionDot key={i} active={active} />
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════ */}
      {/*  HERO — Full viewport, partner name + context        */}
      {/* ═════════════════════════════════════════════════════ */}
      <section
        ref={sec0Ref}
        id="hero"
        className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 bg-sand-50 noise"
      >
        {/* Floating brand */}
        <div className="absolute top-6 left-6 z-10">
          <YonderLogo variant="dark" size="sm" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center max-w-3xl relative z-10"
          ref={heroRef}
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
      <section ref={sec1Ref} id="glance" className="py-28 md:py-40 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">At a glance</p>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-display font-semibold text-ink-900 tracking-display leading-snug max-w-lg mx-auto">
              <SplitHeading
                text="Your Yonder partnership,"
                className="text-ink-900"
              />
              {' '}
              <SplitHeading
                text="by the numbers"
                className="text-ink-300"
                delay={0.3}
              />
            </h2>
          </FadeIn>

          <StaggerList className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" staggerDelay={0.12}>
            <StaggerItem>
              <FloatCard className="bg-sand-50 rounded-2xl border border-sand-200 p-5 md:p-6 text-center cursor-default">
                <p className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  {summary.total_spend_gbp >= 1000 ? (
                    <>£<CountUp to={parseFloat((summary.total_spend_gbp / 1000).toFixed(1))} from={0} duration={2.2} />k</>
                  ) : (
                    <>£<CountUp to={Math.round(summary.total_spend_gbp)} from={0} duration={2.2} separator="," /></>
                  )}
                </p>
                <p className="text-sm font-medium text-ink-600 mb-1">Total customer spend</p>
                <p className="text-xs text-ink-300 leading-relaxed">from Yonder members at your venue</p>
              </FloatCard>
            </StaggerItem>
            <StaggerItem>
              <FloatCard className="bg-sand-50 rounded-2xl border border-sand-200 p-5 md:p-6 text-center cursor-default" delay={0.05}>
                <p className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  <CountUp to={summary.new_users} from={0} duration={2.2} separator="," />
                </p>
                <p className="text-sm font-medium text-ink-600 mb-1">New customers</p>
                <p className="text-xs text-ink-300 leading-relaxed">visited for the first time via Yonder</p>
              </FloatCard>
            </StaggerItem>
            <StaggerItem>
              <FloatCard className="bg-sand-50 rounded-2xl border border-sand-200 p-5 md:p-6 text-center cursor-default" delay={0.1}>
                <p className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  <CountUp to={summary.total_transactions} from={0} duration={2.2} separator="," />
                </p>
                <p className="text-sm font-medium text-ink-600 mb-1">Total visits</p>
                <p className="text-xs text-ink-300 leading-relaxed">avg. {fmt(avgTxn)} per transaction</p>
              </FloatCard>
            </StaggerItem>
            <StaggerItem>
              <FloatCard className="bg-sand-50 rounded-2xl border border-sand-200 p-5 md:p-6 text-center cursor-default" delay={0.15}>
                <p className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                  <CountUp to={Math.round(repeatRate)} from={0} duration={2.2} />%
                </p>
                <p className="text-sm font-medium text-ink-600 mb-1">Came back again</p>
                <p className="text-xs text-ink-300 leading-relaxed">of all visits were returning customers</p>
              </FloatCard>
            </StaggerItem>
          </StaggerList>

          {/* Secondary stats row */}
          {((summary.total_points_earned ?? 0) > 0 || (summary.experience_engagement_rate ?? 0) > 0) && (
            <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-5" staggerDelay={0.1}>
              {(summary.total_points_earned ?? 0) > 0 && (
                <StaggerItem>
                  <FloatCard className="bg-sand-50 rounded-2xl border border-sand-200 p-5 flex items-center gap-4 cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-coral-50 flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 2L11.09 6.26L16 7L12.5 10.4L13.18 15L9 12.77L4.82 15L5.5 10.4L2 7L6.91 6.26L9 2Z" fill="#F04E37" opacity="0.8"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-ink-900 font-tabular tracking-tight leading-none mb-1">
                        <CountUp to={summary.total_points_earned ?? 0} from={0} duration={2.2} separator="," />
                      </p>
                      <p className="text-sm font-medium text-ink-600">Yonder points earned</p>
                      <p className="text-xs text-ink-300 mt-0.5">by customers visiting {summary.display_name}</p>
                    </div>
                  </FloatCard>
                </StaggerItem>
              )}
              {(summary.experience_engagement_rate ?? 0) > 0 && (
                <StaggerItem>
                  <FloatCard className="bg-sand-50 rounded-2xl border border-sand-200 p-5 flex items-center gap-4 cursor-default" delay={0.08}>
                    <div className="w-10 h-10 rounded-xl bg-coral-50 flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="7" stroke="#F04E37" strokeWidth="1.5" opacity="0.8"/>
                        <path d="M6 9l2 2 4-4" stroke="#F04E37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-ink-900 font-tabular tracking-tight leading-none mb-1">
                        <CountUp to={Math.round((summary.experience_engagement_rate ?? 0) * 100)} from={0} duration={2.2} />%
                      </p>
                      <p className="text-sm font-medium text-ink-600">Reward engagement rate</p>
                      <p className="text-xs text-ink-300 mt-0.5">{summary.experience_matched_transactions} visits triggered a Yonder reward</p>
                    </div>
                  </FloatCard>
                </StaggerItem>
              )}
            </StaggerList>
          )}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════ */}
      {/*  THE REWARDS EFFECT — On/Off Yonder comparison       */}
      {/* ═════════════════════════════════════════════════════ */}
      {hasOnOff && (
        <section ref={sec2Ref} id="rewards-effect" className="py-28 md:py-40 bg-sand-50">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-10">
              <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">The rewards effect</p>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-display font-semibold text-ink-900 tracking-display leading-snug max-w-xl mx-auto">
                <SplitHeading text="When your rewards are live, your customers spend more" />
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
                <motion.p
                  className={`text-[clamp(4rem,12vw,8rem)] font-display font-semibold tracking-tighter leading-none ${
                    incrementalPositive ? 'text-gradient-coral' : 'text-ink-200'
                  }`}
                  initial={{ opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
                  whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 1, ease }}
                >
                  {incrementalPositive ? '+' : ''}
                  <CountUp to={Math.round(summary.incremental_spend)} from={0} duration={2.5} separator="," />
                </motion.p>
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
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.5, ease }}
                >
                  That&apos;s a {Math.round(upliftPct)}% uplift
                </motion.p>
              )}
            </FadeIn>

            {/* On vs Off comparison cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <FloatCard delay={0} className="rounded-2xl bg-coral-50/60 border border-coral-100 px-6 py-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-40" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-coral" />
                  </span>
                  <span className="text-[11px] font-semibold text-coral uppercase tracking-caps">Rewards live</span>
                </div>
                <p className="text-2xl md:text-3xl font-semibold text-ink-900 font-tabular tracking-tight">{fmt(summary.avg_monthly_on_spend)}</p>
                <p className="text-xs text-ink-400 mt-1.5">avg. monthly spend · {activeMonthCount} months</p>
              </FloatCard>
              <FloatCard delay={0.08} className="rounded-2xl bg-sand-100 border border-sand-200 px-6 py-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-ink-200" />
                  <span className="text-[11px] font-semibold text-ink-300 uppercase tracking-caps">Rewards off</span>
                </div>
                <p className="text-2xl md:text-3xl font-semibold text-ink-900 font-tabular tracking-tight">{fmt(summary.avg_monthly_off_spend)}</p>
                <p className="text-xs text-ink-300 mt-1.5">avg. monthly spend · {inactiveMonthCount} months</p>
              </FloatCard>
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
      <section ref={sec3Ref} id="customers" className={`py-28 md:py-40 ${hasOnOff ? 'bg-white' : 'bg-sand-50'}`}>
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">Customer acquisition</p>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-display font-semibold text-ink-900 tracking-display leading-snug max-w-xl mx-auto">
              Yonder brought{' '}
              <motion.span
                className="text-coral"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: 0.2, ease }}
              >
                {summary.new_users.toLocaleString()}
              </motion.span>{' '}
              <SplitHeading text="new customers to your door" delay={0.3} />
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
            <FloatCard delay={0} className="bg-sand-50 rounded-2xl border border-sand-200 p-5 text-center cursor-default">
              <p className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                <CountUp to={summary.new_users} from={0} duration={2} separator="," />
              </p>
              <p className="text-xs font-medium text-ink-600">First-time visitors</p>
              <p className="text-[11px] text-ink-300 mt-1">{fmt(summary.new_spend_gbp)} total spend</p>
            </FloatCard>
            <FloatCard delay={0.1} className="bg-sand-50 rounded-2xl border border-sand-200 p-5 text-center cursor-default">
              <p className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                <CountUp to={Math.round(repeatRate)} from={0} duration={2} /><span>%</span>
              </p>
              <p className="text-xs font-medium text-ink-600">Repeat rate</p>
              <p className="text-[11px] text-ink-300 mt-1">came back for another visit</p>
            </FloatCard>
            <FloatCard delay={0.2} className="bg-sand-50 rounded-2xl border border-sand-200 p-5 text-center cursor-default">
              <p className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold text-ink-900 tracking-tight leading-none mb-2 font-tabular">
                <CountUp to={summary.unique_users} from={0} duration={2} separator="," />
              </p>
              <p className="text-xs font-medium text-ink-600">Total unique visitors</p>
              <p className="text-[11px] text-ink-300 mt-1">across the whole period</p>
            </FloatCard>
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
        <section ref={sec4Ref} id="boosts" className="py-28 md:py-40 bg-sand-50">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">Reward boosts</p>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-display font-semibold text-ink-900 tracking-display leading-snug max-w-xl mx-auto">
                <SplitHeading text="Time-limited boosts drove additional engagement" />
              </h2>
            </FadeIn>

            <FadeIn delay={0.1} className="text-center mb-12">
              <p className="text-base text-ink-400 max-w-lg mx-auto leading-relaxed">
                During special promotional windows, Yonder featured enhanced rewards for {summary.display_name}.
                These time-limited boosts drove measurable spikes in customer activity.
              </p>
            </FadeIn>

            <StaggerList className="grid grid-cols-2 gap-4 text-center" staggerDelay={0.12}>
              <StaggerItem>
                <FloatCard className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-card cursor-default">
                  <p className="text-2xl font-semibold text-ink-900 font-tabular tracking-tight">
                    <CountUp to={summary.boost_transactions} from={0} duration={2} separator="," />
                  </p>
                  <p className="text-xs text-ink-400 mt-1">boost visits</p>
                </FloatCard>
              </StaggerItem>
              <StaggerItem>
                <FloatCard className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-card cursor-default" delay={0.1}>
                  <p className="text-2xl font-semibold text-ink-900 font-tabular tracking-tight">{fmt(summary.boost_spend_gbp)}</p>
                  <p className="text-xs text-ink-400 mt-1">boost spend</p>
                </FloatCard>
              </StaggerItem>
            </StaggerList>
          </div>
        </section>
      )}

      {/* ═════════════════════════════════════════════════════ */}
      {/*  SPEND OVER TIME (for partners without on/off data)  */}
      {/* ═════════════════════════════════════════════════════ */}
      {!hasOnOff && (
        <section id="performance" className="py-28 md:py-40 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <p className="text-[11px] font-semibold text-coral uppercase tracking-caps mb-4">Performance</p>
              <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-display font-semibold text-ink-900 tracking-display">
                <SplitHeading text="How spend grew over time" />
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
      {/*  KEY TAKEAWAYS — sticky scroll sequence              */}
      {/* ═════════════════════════════════════════════════════ */}
      {summary.insights.length > 0 && (
        <div
          ref={insightRef}
          style={{ height: `${summary.insights.length * 100}vh` }}
          className="relative"
        >
          <section
            ref={sec5Ref}
            id="insights"
            className="sticky top-0 h-screen overflow-hidden flex items-center bg-white"
          >
            <div className="w-full max-w-4xl mx-auto px-8 md:px-12 relative">

              {/* Ghost number — huge typographic background element */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeInsight}
                  initial={{ opacity: 0, y: 80, scale: 0.9 }}
                  animate={{ opacity: 0.055, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -60, scale: 1.05 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  aria-hidden
                  className="absolute -top-[12vw] right-0 text-[32vw] md:text-[22vw] font-display font-bold text-ink-900 leading-none select-none pointer-events-none"
                >
                  {String(activeInsight + 1).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>

              {/* Label */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease }}
                className="text-xs font-medium text-coral mb-6 tracking-wider uppercase"
              >
                Key takeaways
              </motion.p>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.08, ease }}
                className="text-sm font-medium text-ink-300 mb-10"
              >
                What this means for {summary.display_name}
              </motion.h2>

              {/* Insight text — transitions on each scroll step */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeInsight}
                  initial={{ opacity: 0, y: 36, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[clamp(1.15rem,2.8vw,1.65rem)] font-display font-semibold text-ink-900 leading-[1.35] max-w-2xl tracking-tight"
                >
                  {summary.insights[activeInsight]}
                </motion.p>
              </AnimatePresence>

              {/* Progress track */}
              <div className="flex items-center gap-3 mt-14">
                <div className="flex gap-1.5">
                  {summary.insights.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i === activeInsight ? 28 : 6,
                        backgroundColor: i === activeInsight ? '#E8503A' : '#E4E4E0',
                        opacity: i < activeInsight ? 0.35 : 1,
                      }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="h-[3px] rounded-full"
                    />
                  ))}
                </div>
                <span className="text-xs text-ink-300 font-tabular ml-1">
                  {activeInsight + 1} / {summary.insights.length}
                </span>
              </div>

              {/* Scroll hint (only on first insight) */}
              <AnimatePresence>
                {activeInsight === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="absolute bottom-12 left-8 md:left-12 text-[11px] text-ink-200 flex items-center gap-1.5"
                  >
                    <motion.span
                      animate={{ y: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                    >↓</motion.span>
                    Scroll to continue
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
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

