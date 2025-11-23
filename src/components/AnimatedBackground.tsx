// src/components/AnimatedBackground.tsx
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

// Define the keyframes for the gradient animation
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const AnimatedBackground = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Place it behind everything
        background: 'linear-gradient(-45deg, #0D47A1, #1976D2, #42A5F5, #90CAF9)',
        backgroundSize: '400% 400%',
        animation: `${gradientAnimation} 15s ease infinite`,
      }}
    />
  );
};