/**
 * @module components/motion
 *
 * Shared animation primitives for the Yonder reporting platform.
 * All components use `motion/react` (motion v12) and respect
 * `prefers-reduced-motion` via CSS fallback in globals.css.
 *
 * Usage:
 *   import { FadeIn, StaggerList, StaggerItem, ScaleIn, SlideIn } from '@/components/motion'
 */

'use client'

import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

/* ── Shared easing tokens ────────────────────────────────────── */

const EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
const QUINT_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/* ── FadeIn ──────────────────────────────────────────────────── */

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  y?: number
  className?: string
}

/**
 * Scroll-triggered fade-in with optional vertical offset.
 * Replaces the ad-hoc `Reveal` wrappers used in page components.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  y = 40,
  className = '',
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: EXPO_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── SlideIn ─────────────────────────────────────────────────── */

interface SlideInProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export function SlideIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: SlideInProps) {
  const offset = 32
  const initial = {
    up:    { opacity: 0, y: offset },
    down:  { opacity: 0, y: -offset },
    left:  { opacity: 0, x: offset },
    right: { opacity: 0, x: -offset },
  }[direction]

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: QUINT_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── ScaleIn ─────────────────────────────────────────────────── */

interface ScaleInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function ScaleIn({ children, delay = 0, className = '' }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: EXPO_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── StaggerList + StaggerItem ───────────────────────────────── */

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EXPO_OUT },
  },
}

interface StaggerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

/**
 * Container that staggers the entrance of its `StaggerItem` children.
 * staggerDelay controls pause between each child (default 0.08s).
 */
export function StaggerList({ children, className = '', staggerDelay = 0.08 }: StaggerProps) {
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: staggerDelay } },
  }
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={container}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: StaggerProps) {
  return (
    <motion.div variants={staggerChild} className={className}>
      {children}
    </motion.div>
  )
}

/* ── AnimatedLine ────────────────────────────────────────────── */

/**
 * Horizontal line that draws in from left on scroll.
 */
export function AnimatedLine({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`h-px bg-gray-200 ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 1, ease: EXPO_OUT }}
      style={{ originX: 0 }}
    />
  )
}

/* ── CountReveal ─────────────────────────────────────────────── */

/**
 * Wraps a number and reveals it with a scale-in effect.
 * Use this around CountUp or static numbers.
 */
export function CountReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: EXPO_OUT }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  )
}

/* ── SplitHeading ────────────────────────────────────────────── */

/**
 * Splits a heading string into words and reveals each word with a
 * staggered slide-up entrance on scroll. Use in place of FadeIn for h2s.
 */
export function SplitHeading({
  text,
  className = '',
  delay = 0,
  staggerDelay = 0.06,
}: {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
}) {
  const words = text.split(' ')
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: staggerDelay, delayChildren: delay } },
  }
  const word: Variants = {
    hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EXPO_OUT } },
  }
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={container}
      className={`inline-flex flex-wrap gap-x-[0.3em] gap-y-1 ${className}`}
    >
      {words.map((w, i) => (
        <motion.span key={i} variants={word} className="inline-block">
          {w}
        </motion.span>
      ))}
    </motion.span>
  )
}

/* ── FloatCard ───────────────────────────────────────────────── */

/**
 * Wraps a card element and adds a hover lift + spring shadow.
 * Drop-in replacement around any card div.
 */
export function FloatCard({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: EXPO_OUT }}
      whileHover={{ y: -5, scale: 1.015, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
      whileTap={{ scale: 0.99 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
