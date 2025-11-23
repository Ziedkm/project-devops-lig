// src/components/WavyBackground.tsx
import Wave from 'react-wavify';
import { Box, useTheme } from '@mui/material';

export const WavyBackground = () => {
  // We use the useTheme hook to access our color palette
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Keep it behind all other content
        overflow: 'hidden',
        // Set a solid base color in case the waves don't fill the screen on resize
        backgroundColor: theme.palette.primary.dark,
      }}
    >
      {/* Wave 1: The darkest, slowest, largest wave at the back */}
      <Wave
        fill={theme.palette.primary.main}
        paused={false}
        style={{ position: 'absolute', bottom: 0 }}
        options={{
          height: 20,
          amplitude: 40,
          speed: 0.15,
          points: 3,
        }}
      />
      {/* Wave 2: A medium color wave with slightly different properties */}
      <Wave
        fill={theme.palette.primary.light}
        paused={false}
        style={{ position: 'absolute', bottom: 0 }}
        options={{
          height: 30,
          amplitude: 30,
          speed: 0.2,
          points: 4,
        }}
      />
      {/* Wave 3: The lightest, fastest, smallest wave at the front */}
      <Wave
        fill={theme.palette.primary.main}
        paused={false}
        style={{ position: 'absolute', bottom: 0 }}
        options={{
          height: 40,
          amplitude: 20,
          speed: 0.25,
          points: 5,
        }}
      />
      <Wave
        fill={theme.palette.primary.light}
        paused={false}
        style={{ position: 'absolute', bottom: 0 }}
        options={{
          height: 30,
          amplitude: 30,
          speed: 0.2,
          points: 4,
        }}
      />
    </Box>
  );
};