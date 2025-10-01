'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BackGuard() {
  const router = useRouter()

  useEffect(() => {
    // Ensure there is a history entry to intercept back navigation
    try { window.history.pushState(null, '', window.location.href) } catch {}

    const onPopState = () => {
      const ok = window.confirm('Are you sure you want to go back?')
      if (ok) {
        try { localStorage.removeItem('debunk:state') } catch {}
        router.replace('/')
      } else {
        // Cancel back by pushing current state again
        try { window.history.pushState(null, '', window.location.href) } catch {}
      }
    }

    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('popstate', onPopState)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [router])

  return null
}


