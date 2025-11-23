import { Box, CircularProgress, Typography } from '@mui/material';

interface CircularProgressWithLabelProps {
  value: number; // The percentage value (e.g., 32 for 32%)
  label: string; // The number to display in the middle (e.g., "8")
}

function CircularProgressWithLabel({ value, label }: CircularProgressWithLabelProps) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', width: 100, height: 100 }}>
      {/* This is the grey background track */}
      <CircularProgress
        variant="determinate"
        value={100}
        sx={{
          color: (theme) => theme.palette.grey[200],
          position: 'absolute',
          left: 0,
        }}
        size={100}
        thickness={4}
      />
      {/* This is the actual progress indicator */}
      <CircularProgress
        variant="determinate"
        value={value}
        size={100}
        thickness={4}
      />
      {/* This is the label in the center */}
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" component="div" fontWeight="bold">
          {label}
        </Typography>
        <Typography variant="caption" component="div" color="text.secondary">
          jours
        </Typography>
      </Box>
    </Box>
  );
}

export default CircularProgressWithLabel;