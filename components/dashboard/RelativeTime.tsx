'use client'

import React, { useState, useEffect } from 'react'
import { formatDate, formatRelativeDate } from '@/lib/utils'

interface RelativeTimeProps {
  date: string
  className?: string
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  // Initial state uses static deterministic formatting to avoid prerender time evaluation
  const [text, setText] = useState<string>(() => formatDate(date))

  // Relative time is calculated exclusively on client after mount
  useEffect(() => {
    setText(formatRelativeDate(date))
  }, [date])

  return <span className={className}>{text}</span>
}

