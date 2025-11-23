import { Box, Typography, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface CalendarHeaderProps {
  view: string;
  onViewChange: (view: string) => void;
  // We'll add more props like onNext, onPrev later
}

function CalendarHeader({ view, onViewChange }: CalendarHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold">Calendar</Typography>
        <Typography color="text.secondary">View and manage your scheduled events.</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_e, newView) => newView && onViewChange(newView)}
          aria-label="calendar view"
          
        >
          <ToggleButton value="dayGridMonth" aria-label="month view">Month</ToggleButton>
          <ToggleButton value="timeGridWeek" aria-label="week view">Week</ToggleButton>
          <ToggleButton value="timeGridDay" aria-label="day view">Day</ToggleButton>
        </ToggleButtonGroup>
        <Button variant="contained" startIcon={<AddIcon />}>Create</Button>
      </Box>
    </Box>
  );
}

export default CalendarHeader;