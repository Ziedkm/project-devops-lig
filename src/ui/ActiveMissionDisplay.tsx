// src/ui/ActiveMissionDisplay.tsx
import { Chip, CircularProgress, Box } from '@mui/material';
import { useActiveMission } from '../features/missions/useActiveMission';

export function ActiveMissionDisplay() {
  // On utilise notre hook pour récupérer la mission active et son état de chargement
  const { activeMission, isLoadingActiveMission } = useActiveMission();

  // Pendant que les données chargent, on affiche un petit spinner discret
  if (isLoadingActiveMission) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '32px' }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  // Si aucune mission n'est active, on n'affiche rien du tout
  if (!activeMission) {
    return null;
  }

  // Si une mission est active, on affiche son nom dans un Chip stylisé
  return (
    <Chip 
      label={`Mission Active: ${activeMission.client_name}`}
      color="success"
      variant="outlined"
      size="small"
      sx={{
        fontWeight: 500,
        animation: 'fadeIn 0.5s ease-out'
      }}
    />
  );
}