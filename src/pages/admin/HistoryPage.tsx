// src/pages/admin/HistoryPage.tsx
import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Chip,
  Card,
  Stack,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { keyframes } from '@emotion/react';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';

import { getHistoryLog } from '../../services/apiHistory';
import HistoryTimeline from '../../features/history/HistoryTimeline';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

function HistoryPage() {
  const [filters, setFilters] = useState<{
    operationType: string;
    startDate: Date | null;
    endDate: Date | null;
  }>({
    operationType: 'all',
    startDate: null,
    endDate: null,
  });

  const { data: historyLogs, isLoading, error, refetch } = useQuery({
    queryKey: ['history', filters],
    queryFn: () => getHistoryLog({
      operationType: filters.operationType === 'all' ? null : filters.operationType,
      dateRange: {
        startDate: filters.startDate,
        endDate: filters.endDate
      }
    }),
  });

  const handleClearFilters = () => {
    setFilters({
      operationType: 'all',
      startDate: null,
      endDate: null,
    });
  };

  const activeFiltersCount = [
    filters.operationType !== 'all',
    filters.startDate !== null,
    filters.endDate !== null,
  ].filter(Boolean).length;

  return (
    <Box sx={{ animation: `${fadeInUp} 0.5s ease-out` }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Historique des Actions
        </Typography>
        <Typography color="text.secondary">
          Journal d'audit de toutes les modifications apportées aux missions
        </Typography>
      </Box>

      {/* Filters Card */}
      <Card sx={{ 
        mb: 3, 
        p: 3,
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Filtres
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip 
                label={`${activeFiltersCount} actif${activeFiltersCount > 1 ? 's' : ''}`}
                size="small"
                color="primary"
              />
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button 
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              sx={{ textTransform: 'none' }}
            >
              Actualiser
            </Button>
            {activeFiltersCount > 0 && (
              <Button 
                size="small"
                onClick={handleClearFilters}
                sx={{ textTransform: 'none' }}
              >
                Réinitialiser
              </Button>
            )}
          </Stack>
        </Box>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          sx={{ bgcolor: 'white', p: 2, borderRadius: 2 }}
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Type d'action</InputLabel>
            <Select
              value={filters.operationType}
              label="Type d'action"
              onChange={(e) => setFilters(prev => ({ ...prev, operationType: e.target.value }))}
            >
              <MenuItem value="all">Tous les types</MenuItem>
              <MenuItem value="INSERT">Création</MenuItem>
              <MenuItem value="UPDATE">Modification</MenuItem>
              <MenuItem value="DELETE">Suppression</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Date de début"
              value={filters.startDate}
              onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
              slotProps={{
                textField: { size: 'small', sx: { minWidth: 200 } },
                actionBar: { actions: ['clear'] }
              }}
            />

            <DatePicker
              label="Date de fin"
              value={filters.endDate}
              onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
              minDate={filters.startDate || undefined}
              slotProps={{
                textField: { size: 'small', sx: { minWidth: 200 } },
                actionBar: { actions: ['clear'] }
              }}
            />
          </LocalizationProvider>
        </Stack>
      </Card>

      {/* Timeline Content */}
      <Paper sx={{ 
        p: { xs: 2, sm: 4 }, 
        borderRadius: 3, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        minHeight: '400px',
      }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Erreur de chargement
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error.message}
            </Typography>
          </Box>
        )}
        
        {!isLoading && !error && (!historyLogs || historyLogs.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun historique trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aucune action ne correspond aux filtres sélectionnés
            </Typography>
          </Box>
        )}
        
        {!isLoading && !error && historyLogs && historyLogs.length > 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                {historyLogs.length} action{historyLogs.length > 1 ? 's' : ''} trouvée{historyLogs.length > 1 ? 's' : ''}
              </Typography>
            </Box>
            <HistoryTimeline logs={historyLogs} />
          </>
        )}
      </Paper>
    </Box>
  );
}

export default HistoryPage;
