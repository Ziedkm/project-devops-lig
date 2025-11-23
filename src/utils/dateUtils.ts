// src/utils/dateUtils.ts

import { differenceInCalendarDays, getYear, eachYearOfInterval, parseISO } from 'date-fns';

/**
 * Calculate the number of calendar days between two dates
 */
export function calculateDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  return differenceInCalendarDays(end, start) + 1; // +1 to include both start and end date
}

/**
 * Get all years spanned by a date range
 */
export function getYearsInRange(startDate: Date | string, endDate: Date | string): number[] {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const years = eachYearOfInterval({ start, end });
  return years.map(year => getYear(year));
}

/**
 * Format date for display
 */
export function formatDateForDB(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}