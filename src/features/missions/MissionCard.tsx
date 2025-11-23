// src/features/missions/MissionCard.tsx
import { Card, CardContent, Typography, Box, Button, Chip, Divider, IconButton, CircularProgress, Skeleton } from '@mui/material';
import { Clock, Download, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDeleteMission, useSyncHolidays, useToggleMissionStatus, useMissionStats } from './useMissions';
import { getYearsInRange } from '../../utils/dateUtils'; // Import the utility
import type { Mission } from '../../services/apiMissions';

const Stat = ({ title, value, isLoading = false }: { title: string, value: string | number, isLoading?: boolean }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
      {title}
    </Typography>
    <Typography fontWeight="bold" variant="h6">
      {isLoading ? <Skeleton width={60} /> : value}
    </Typography>
  </Box>
);

export function MissionCard({ mission, onEdit }: { mission: Mission, onEdit: () => void }) {
  const { employee } = useAuth();
  const isAdmin = employee?.role === 'admin';

  const { isDeleting, deleteMission } = useDeleteMission();
  const { isSyncing, syncHolidays } = useSyncHolidays();
  const { isToggling, toggleStatus } = useToggleMissionStatus();
  const { stats, isLoadingStats } = useMissionStats(mission);

  // Updated to use years array
  const handleSync = () => {
    if (!mission.id || !mission.country_code) return;
    
    let yearsToSync: number[];
    
    // If mission has start/end dates, sync all years in that range
    if (mission.start_date && mission.end_date) {
      yearsToSync = getYearsInRange(mission.start_date, mission.end_date);
    } else {
      // Fallback to just the mission year
      yearsToSync = [mission.year];
    }
    
    syncHolidays({ 
      missionId: mission.id, 
      years: yearsToSync, 
      countryCode: mission.country_code 
    });
  };

  const handleToggleStatus = () => {
    toggleStatus({ missionId: mission.id, newStatus: !mission.is_active });
  };

  const isThresholdReached = !isLoadingStats && stats && typeof stats.daysWorked === 'number' 
    ? stats.daysWorked >= mission.alert_threshold 
    : false;

  return (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: '0 8px 24px -4px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">{mission.client_name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 0.5, gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Clock size={16} style={{ marginRight: 4 }} />
                <Typography variant="body2">
                  {mission.start_date && mission.end_date 
                    ? `${new Date(mission.start_date).toLocaleDateString('fr-FR')} - ${new Date(mission.end_date).toLocaleDateString('fr-FR')}`
                    : `Mission ${mission.year}`
                  }
                </Typography>
              </Box>
              <Typography variant="body2">• {mission.country_code}</Typography>
            </Box>
          </Box>
          
          {mission.is_active && isThresholdReached && (
            <Chip label="Seuil atteint" color="error" size="small" />
          )}
          {mission.is_active && !isThresholdReached && (
            <Chip label="Active" color="success" size="small" variant="filled" />
          )}
          {!mission.is_active && (
            <Chip 
              label={isToggling ? <CircularProgress size={16} color="inherit" /> : "Non Active"}
              onClick={isAdmin ? handleToggleStatus : undefined}
              disabled={isToggling}
              size="small"
              variant="outlined"
              sx={{ cursor: isAdmin ? 'pointer' : 'default' }}
            />
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 3, my: 3 }}>
          <Stat 
            title="Jours Travaillés" 
            value={`${stats?.daysWorked ?? '...'}/${mission.max_service_days}`} 
            isLoading={isLoadingStats} 
          />
          <Stat title="Seuil d'Alerte" value={mission.alert_threshold} />
          <Stat title="Congés Annuels" value={`${mission.annual_leave_balance} jours`} />
          <Stat 
            title="Progression" 
            value={`${stats?.progression ?? '...'}%`}
            isLoading={isLoadingStats}
          />
        </Box>
        
        {mission.assignment_employees && mission.assignment_employees.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Employés assignés :
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {mission.assignment_employees.map(({ employees: emp }) => 
                emp ? <Chip key={emp.id_emp} label={`${emp.first_name} ${emp.last_name}`} size="small" /> : null
              )}
            </Box>
          </>
        )}

        {isAdmin && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<Download size={16} />} 
                onClick={handleSync} 
                disabled={isSyncing} 
                size="small"
              >
                {isSyncing ? 'Synchronisation...' : 'Sync Jours Fériés'}
              </Button>
              <Box>
                <IconButton onClick={onEdit} aria-label="Modifier la mission">
                  <Edit size={20} />
                </IconButton>
                <IconButton 
                  onClick={() => deleteMission(mission.id)} 
                  disabled={isDeleting} 
                  color="error" 
                  aria-label="Supprimer la mission"
                >
                  {isDeleting ? <CircularProgress size={20} color="inherit" /> : <Trash2 size={20} />}
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
