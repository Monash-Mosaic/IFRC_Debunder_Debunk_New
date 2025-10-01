import { NextResponse } from 'next/server'
import { loadQuestions } from '../../../../lib/questions.server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export function GET(_req, { params }) {
  const all = loadQuestions()
  const id = Number(params.id)
  if (!Number.isInteger(id) || id < 0 || id >= all.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const { question, options, correctAnswer, whyCorrect, whyIncorrect } = all[id]
  return NextResponse.json({ id, question, options, correctAnswer, whyCorrect, whyIncorrect })
}


