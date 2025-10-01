'use client'

import { useRouter } from 'next/navigation'

export default function StartButton() {
  const router = useRouter()

  function shuffle(array) {
    const a = array.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const onStart = async () => {
    try {
      const res = await fetch('/api/new-game', { cache: 'no-store' })
      const data = await res.json()
      const order = Array.isArray(data.order) && data.order.length ? data.order : [0]
      const state = { order, current: 0, score: 0, lives: 3, max: data.max || Math.min(3, order.length) }
      localStorage.setItem('debunk:state', JSON.stringify(state))
      router.push('/quiz')
    } catch {
      // Fallback client-side randomization
      const total = 20
      const max = 3
      const all = Array.from({ length: total }, (_, i) => i)
      const order = shuffle(all).slice(0, max)
      const state = { order, current: 0, score: 0, lives: 3, max }
      localStorage.setItem('debunk:state', JSON.stringify(state))
      router.push('/quiz')
    }
  }

  return (
    <button className="btn btn-filled" onClick={onStart}>
      START
    </button>
  )
}


