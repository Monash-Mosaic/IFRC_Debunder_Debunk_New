'use client'

import { useRouter } from 'next/navigation'

export default function AnswerButtons({ correctAnswer, whyCorrect, whyIncorrect }) {
  const router = useRouter()

  const onAnswer = (choice) => {
    const isCorrect = choice === correctAnswer
    let state
    try { state = JSON.parse(localStorage.getItem('debunk:state') || 'null') } catch { state = null }
    if (!state) return router.replace('/')

    const delta = isCorrect ? 10 : -1
    const next = {
      ...state,
      score: Math.max(0, (state.score || 0) + delta),
      lives: isCorrect ? state.lives : Math.max(0, (state.lives || 0) - 1),
      lastStatus: isCorrect ? 'correct' : 'incorrect',
      lastExplain: isCorrect ? (whyCorrect || '') : (whyIncorrect || ''),
      // advance to next question; cap at max-1 so result screen can decide what next to do
      current: Math.min((state.current || 0) + 1, (state.max || 3) - 1)
    }
    localStorage.setItem('debunk:state', JSON.stringify(next))
    router.push('/quiz/result')
  }

  return (
    <div className="quiz-actions">
      <button className="btn btn-true" aria-label="Answer True" onClick={() => onAnswer('TRUE')}>TRUE</button>
      <button className="btn btn-false" aria-label="Answer False" onClick={() => onAnswer('FALSE')}>FALSE</button>
    </div>
  )
}


