import { Paper, Typography, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { format } from 'date-fns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { EventApi } from '@fullcalendar/core';

const EVENT_TYPE_COLORS: { [key: string]: { bg: string; border: string; text: string } } = {
    HOLIDAY: { bg: '#e6f7ff', border: '#91d5ff', text: '#096dd9' },
    SICK_LEAVE: { bg: '#fffbe6', border: '#ffe58f', text: '#d46b08' },
    REMOTE_WORK: { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' },
    DEFAULT: { bg: '#fafafa', border: '#d9d9d9', text: '#595959' },
};

interface CalendarSidebarProps {
  events: EventApi[]; // We'll pass the currently visible events here
}

function CalendarSidebar({ events }: CalendarSidebarProps) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid #e5e7eb' }}>
      <Typography variant="h6" fontWeight={600}>Scheduled Events</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {format(new Date(), 'EEEE, dd MMMM')}
      </Typography>

      <List>
        {events.length > 0 ? (
          events.map((event: EventApi) => (
            <ListItem 
              key={event.id} 
              sx={{ 
                bgcolor: EVENT_TYPE_COLORS[event.extendedProps.type || 'DEFAULT']?.bg || EVENT_TYPE_COLORS.DEFAULT.bg,
                border: `1px solid ${EVENT_TYPE_COLORS[event.extendedProps.type || 'DEFAULT']?.border || EVENT_TYPE_COLORS.DEFAULT.border}`,
                borderRadius: 2,
                mb: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: EVENT_TYPE_COLORS[event.extendedProps.type || 'DEFAULT']?.text || EVENT_TYPE_COLORS.DEFAULT.text }}>
                <AccessTimeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={event.title} 
                slotProps={{
                  primary: {
                    style: {
                      fontWeight: 600,
                      color: EVENT_TYPE_COLORS[event.extendedProps.type || 'DEFAULT']?.text || EVENT_TYPE_COLORS.DEFAULT.text,
                    }
                  }
                }}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">No events for today.</Typography>
        )}
      </List>
    </Paper>
  );
}

export default CalendarSidebar;