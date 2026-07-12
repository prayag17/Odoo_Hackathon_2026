export function formatCurrency(amount: number | string | null | undefined): string {
  const value = Number(amount) || 0
  return `Rs ${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value == null) return '—'
  return Number(value).toLocaleString('en-IN')
}
