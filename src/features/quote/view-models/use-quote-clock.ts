import { useEffect } from 'react'
import { quoteRepository } from '../models/quote-repository'

export function useQuoteClock() {
  useEffect(() => {
    const expire = () => quoteRepository.expire()
    expire()
    const timer = window.setInterval(expire, 15000)
    window.addEventListener('focus', expire)
    document.addEventListener('visibilitychange', expire)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', expire); document.removeEventListener('visibilitychange', expire) }
  }, [])
}
