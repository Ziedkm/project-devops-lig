import { GlobalStyles } from '@mui/material';

// A map for our event types to their colors
export const EVENT_TYPE_COLORS: { [key: string]: { bg: string; border: string; text: string } } = {
  VACATION: { bg: '#e0e7ff', border: '#a5b4fc', text: '#3730a3' },
  SICK_LEAVE: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  PUBLIC_HOLIDAY: { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
  WORKED: { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
  DEFAULT: { bg: '#e5e7eb', border: '#9ca3af', text: '#1f2937' },
};

// This component will be imported into our main CalendarPage
export function CalendarGlobalStyles() {
  return (
    <GlobalStyles styles={{
      /* --- MAIN CALENDAR CONTAINER --- */
      '.fc': {
        '--fc-border-color': '#e5e7eb',
        '--fc-today-bg-color': '#f9fafb', // Subtle background for today's date
        '--fc-event-border-color': 'transparent',
      },
      /* --- TOOLBAR & HEADER --- */
      '.fc .fc-toolbar.fc-header-toolbar': {
        marginBottom: '1.5rem',
      },
      '.fc .fc-toolbar-title': {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#111827',
      },
      '.fc .fc-button': {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#6b7280',
        '&:hover': {
          backgroundColor: '#f3f4f6',
        },
      },
      '.fc .fc-col-header-cell': { // The "Mon", "Tue", etc.
        border: 'none',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        fontSize: '0.75rem',
      },
      /* --- DAY GRID CELLS --- */
      '.fc .fc-daygrid-day': {
        borderWidth: '0 1px 1px 0', // Creates the inner grid lines
        padding: '4px',
      },
      '.fc .fc-daygrid-day:first-of-type': {
          borderLeftWidth: '1px',
      },
      '.fc-theme-standard .fc-scrollgrid': {
        borderTop: '1px solid var(--fc-border-color)', // Top border for the whole grid
      },
      '.fc .fc-daygrid-day-number': {
        padding: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
      '.fc .fc-day-other .fc-daygrid-day-number': {
        color: '#d1d5db',
      },

      /* --- EVENT CHIP STYLING --- */
      '.fc-daygrid-event': {
        borderRadius: '6px !important',
        padding: '4px 8px !important',
        whiteSpace: 'normal',
        overflow: 'hidden',
        boxShadow: 'none',
      },
      // Dynamically generated class names for event types
      ...Object.entries(EVENT_TYPE_COLORS).reduce((acc, [key, value]) => {
        acc[`.event-${key.toLowerCase()}`] = {
          backgroundColor: `${value.bg} !important`,
          border: `1px solid ${value.border} !important`,
        };
        acc[`.event-${key.toLowerCase()} .fc-event-main, .event-${key.toLowerCase()} .fc-event-time`] = {
          color: `${value.text} !important`,
        };
        return acc;
      }, {} as any),
    }} />
  );
}