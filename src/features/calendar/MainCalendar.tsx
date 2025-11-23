// src/features/calendar/MainCalendar.tsx

import { useState, forwardRef } from 'react'; // Import forwardRef
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { Box, Button, ButtonGroup, Typography, keyframes, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Animation for events (no changes needed)
const eventAppear = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Custom event rendering (no changes needed)
const renderEventContent = (eventInfo: any) => {
  const { title, duration, icon } = eventInfo.event.extendedProps;

  return (
    <Box
      sx={{
        width: '100%',
        p: '6px 10px',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: eventInfo.backgroundColor,
        color: eventInfo.textColor,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        animation: `${eventAppear} 0.3s ease-in-out`,
        '&:hover': {
          transform: 'scale(1.02)',
          transition: 'transform 0.2s ease-in-out',
        },
      }}
    >
      {icon}
      <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1 }}>
        {title}
      </Typography>
      {duration && duration !== 'FULL_DAY' && (
        <Chip label={duration} size="small" sx={{ height: '18px', fontSize: '0.65rem', bgcolor: 'rgba(0,0,0,0.1)' }} />
      )}
    </Box>
  );
};

// --- FIX START ---

// 1. Update the props interface: Remove `calendarRef` as it's no longer a prop.
interface MainCalendarProps {
  events: any[];
  onDateClick: (arg: { dateStr: string }) => void;
  onCreateClick: () => void;
  isMobile: boolean;
  onEventClick: (clickInfo: any) => void;
  onDateSelect: (selectionInfo: { startStr: string; endStr: string }) => void;
}

// 2. Wrap the component in `forwardRef`.
//    The first generic type is the type of the ref's target (FullCalendar instance).
//    The second is the type of the props (MainCalendarProps).
const MainCalendar = forwardRef<FullCalendar, MainCalendarProps>(
  // 3. The function now receives `props` and `ref` as arguments.
  ({ events, onDateClick, onCreateClick, isMobile, onDateSelect, onEventClick }, ref) => {
    const [currentView, setCurrentView] = useState(isMobile ? 'listWeek' : 'dayGridMonth');

    // Helper to safely access the Calendar API from the forwarded ref
    const getCalendarApi = () => {
      if (ref && 'current' in ref && ref.current) {
        return ref.current.getApi();
      }
      return null;
    };

    const handleViewChange = (view: string) => {
      getCalendarApi()?.changeView(view);
      setCurrentView(view);
    };

    const handleTodayClick = () => {
      getCalendarApi()?.today();
    };

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button onClick={() => handleViewChange('dayGridMonth')} variant={currentView === 'dayGridMonth' ? 'contained' : 'outlined'}>
              Mois
            </Button>
            <Button onClick={() => handleViewChange('listWeek')} variant={currentView === 'listWeek' ? 'contained' : 'outlined'}>
              Liste
            </Button>
            <Button onClick={() => handleViewChange('multiMonthYear')} variant={currentView === 'multiMonthYear' ? 'contained' : 'outlined'}>
              Année
            </Button>
          </ButtonGroup>
          
          {/* 4. Update internal handlers to use the new `getCalendarApi` helper */}
          <Button variant="outlined" size="small" onClick={handleTodayClick}>
            Aujourd'hui
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' },color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            onClick={onCreateClick}
          >
            Créer une absence
          </Button>
        </Box>

        {/* Calendar */}
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            /* ... sx styles are unchanged ... */
            '--fc-border-color': '#e5e7eb',
            '--fc-today-bg-color': '#f9fafb',
            '--fc-button-bg-color': '#ffffff',
            '--fc-button-active-bg-color': 'primary.main',
            '--fc-button-text-color': '#374151',
            '--fc-button-hover-bg-color': '#f9fafb',
            '& .fc-toolbar-title': { fontSize: '1.75rem !important', fontWeight: 700 },
            '& .fc-col-header-cell-cushion': { fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', fontSize: '0.75rem' },
            '& .fc-daygrid-day-number': { p: 1.5, fontSize: '0.875rem' },
            '& .fc-event': { border: 'none !important', background: 'transparent !important' },
            '& .fc-list-day-cushion': { bgcolor: '#f9fafb', p: 1.5, borderRadius: 2 },
            '& .fc-list-event-title': { fontWeight: 600 },
            '& .fc-multimonth-title': { fontSize: '1rem !important', fontWeight: 600 },
          }}
        >
          <FullCalendar
            // 5. Pass the forwarded `ref` directly to FullCalendar.
            ref={ref}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin, interactionPlugin]}
            locale={frLocale}
            headerToolbar={{
              left: 'title',
              center: '',
              right: 'prev,next',
            }}
            selectable={true}
            selectMirror={true}
            initialView={currentView}
            height="100%"
            events={events}
            eventClick={onEventClick}
            eventContent={renderEventContent}
            dateClick={onDateClick}
            dayMaxEvents={5}
            select={onDateSelect}
            navLinks={true}
          />
        </Box>
      </Box>
    );
  }
);

// --- FIX END ---

export default MainCalendar;