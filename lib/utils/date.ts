import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns'
import { sv, enUS } from 'date-fns/locale'

export function getWeekDates(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }) // Sunday
  
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
    startDate: start,
    endDate: end
  }
}

export function formatDate(date: string | Date, formatStr: string, locale: string = 'sv') {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const localeObj = locale === 'sv' ? sv : enUS
  
  return format(dateObj, formatStr, { locale: localeObj })
}

export function getWeekDays(startDate: Date) {
  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i))
  }
  return days
}

export function isSameDay(date1: Date | string, date2: Date | string) {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
  
  return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd')
}

export function formatTime(dateString: string) {
  const date = parseISO(dateString)
  return format(date, 'HH:mm')
}