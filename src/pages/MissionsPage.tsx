// src/pages/MissionsPage.tsx
import { useState } from 'react';
import { Box, Typography, Button, Tabs, Tab, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import { useMissions } from '../features/missions/useMissions';
import { MissionCard } from '../features/missions/MissionCard';
import { AddMissionModal } from '../features/missions/AddMissionModal';
import { EditMissionModal } from '../features/missions/EditMissionModal';
import type { Mission } from '../services/apiMissions'; // <-- CORRIGÉ: Importe le type correct

function MissionsPage() {
  const { employee } = useAuth();
  const isAdmin = employee?.role === 'admin';

  const { isLoading, missions, error } = useMissions();
  const [tabIndex, setTabIndex] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null); // <-- CORRIGÉ: Utilise le type Mission

  const handleOpenEditModal = (mission: Mission) => setMissionToEdit(mission);
  const handleCloseEditModal = () => setMissionToEdit(null);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Erreur: {(error as Error).message}</Typography>;

  return (
    <>
      <Box sx={{ p: { xs: 2, sm: 3 }, animation: 'fadeIn 0.5s ease-out' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Missions</Typography>
            <Typography color="text.secondary">Gérez vos missions et configurations de temps de travail</Typography>
          </Box>
          
          {isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddModalOpen(true)} sx={{ textTransform: 'none', color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
              Nouvelle Mission
            </Button>
          )}
        </Box>

        {/* CORRIGÉ: Le paramètre 'e' est maintenant ignoré avec '_' */}
        <Tabs value={tabIndex} onChange={(_event, val) => setTabIndex(val)} sx={{ mb: 3 }}>
          <Tab label="Toutes les missions" />
          <Tab label="Missions actives" />
          <Tab label="Archives" />
        </Tabs>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {missions?.map((mission: Mission) => ( // <-- CORRIGÉ: Utilise le type Mission
            <MissionCard 
              key={mission.id} 
              mission={mission} 
              onEdit={() => handleOpenEditModal(mission)}
            />
          ))}
        </Box>
      </Box>

      {isAdmin && (
        <>
          <AddMissionModal open={isAddModalOpen} handleClose={() => setIsAddModalOpen(false)} />
          <EditMissionModal open={!!missionToEdit} handleClose={handleCloseEditModal} missionToEdit={missionToEdit} />
        </>
      )}
    </>
  );
}

export default MissionsPage;