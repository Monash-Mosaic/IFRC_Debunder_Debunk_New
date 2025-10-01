"use client"

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import BackGuard from '../../components/BackGuard.jsx'

function getResultConfig(status) {
  const isCorrect = status === 'correct'
  return {
    isCorrect,
    badgeText: isCorrect ? '+10' : '-1',
    title: isCorrect ? 'CORRECT!' : 'UH OH!',
    sub: isCorrect ? 'Stroke of genius' : 'Bamboozled',
    explainTitle: isCorrect ? 'Why is this correct?' : 'Why is this incorrect?',
    badgeClass: isCorrect ? 'result-badge' : 'result-badge bad',
    explainClass: isCorrect ? 'result-explain' : 'result-explain bad'
  }
}

function ResultContent() {
  const router = useRouter()
  const sp = useSearchParams() // kept for backward-compat, ignored for state
  const raw = sp.get('status') || ''
  let statusFromUrl = raw === 'correct' ? 'correct' : raw === 'incorrect' ? 'incorrect' : null

  // Load state
  let state
  try {
    state = JSON.parse(localStorage.getItem('debunk:state') || 'null')
  } catch { state = null }
  if (!state) {
    router.replace('/')
    return null
  }

  const { order, current, score, lives, max } = state
  const total = max

  // Determine correctness if not provided via URL (primary path)
  const status = statusFromUrl || state.lastStatus || 'incorrect'
  const cfg = getResultConfig(status)

  // Show score/lives from state

  return (
    <main className="quiz-screen">
      <BackGuard />
      <div className="topbar">
        <div className="left">LIVES {'♥ '.repeat(lives).trim()}</div>
        <div className="right score">SCORE {score.toLocaleString()}</div>
      </div>

      <div className="center">
        <div className="result-wrap">
          <div className={cfg.badgeClass}>{cfg.badgeText}</div>
          <div className="result-title">{cfg.title}</div>
          <div className="result-sub text-plain">{cfg.sub}</div>

          <section className={cfg.explainClass} aria-labelledby="why">
            <h2 id="why" className="text-plain">{cfg.explainTitle}</h2>
            <p className="text-plain">
              {state.lastExplain || 'Explanation unavailable.'}
            </p>
          </section>
        </div>
      </div>

      {current + 1 >= total ? (
        <Link aria-label="Finish and return to home" className="fab-next" href="/" onClick={() => localStorage.removeItem('debunk:state')}>›</Link>
      ) : (
        <Link aria-label="Next question" className="fab-next" href="/quiz">›</Link>
      )}
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="quiz-screen">Loading...</div>}>
      <ResultContent />
    </Suspense>
  )
}



