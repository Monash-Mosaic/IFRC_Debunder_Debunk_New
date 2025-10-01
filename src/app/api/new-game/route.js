export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextResponse } from 'next/server'
import { loadQuestions } from '../../../lib/questions.server'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function GET() {
  const all = loadQuestions()
  const order = shuffle(Array.from({ length: all.length }, (_, i) => i)).slice(0, 3)
  const gameQuestions = order.map(i => all[i])
  return NextResponse.json({ order, questions: gameQuestions, max: 3 })
}


