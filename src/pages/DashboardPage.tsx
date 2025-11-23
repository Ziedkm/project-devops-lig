// src/pages/DashboardPage.tsx
import { useState } from 'react';
import { Box, Typography, Card, CircularProgress, FormControl, Select, MenuItem, Avatar, Chip } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../hooks/useUser';
import { getDashboardStats } from '../services/apiDashboard';
import { getActiveMission } from '../services/apiMissions';
import MonthlyActivityChart from '../features/dashboard/MonthlyActivityChart';
import AbsencePieChart from '../features/dashboard/AbsencePieChart';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import WorkIcon from '@mui/icons-material/Work';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const cardBaseStyles = {
  borderRadius: 5,
  height: '100%',
  p: 3,
  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.07)',
  border: '1px solid rgba(0, 0, 0, 0.04)',
};

function DashboardPage() {
  const { role } = useUser();
  const isAdmin = role === 'admin';
  
  // State for selected employee (admin only)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');

  // Fetch active mission to get employees list
  const { data: activeMission, isLoading: isLoadingMission } = useQuery({
    queryKey: ['activeMission'],
    queryFn: getActiveMission,
  });

  // Fetch dashboard stats with selected employee filter
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardStats', selectedEmployeeId === 'all' ? undefined : selectedEmployeeId],
    queryFn: () => getDashboardStats(selectedEmployeeId === 'all' ? undefined : selectedEmployeeId),
  });

  // Get employees list from active mission
  const employees = activeMission?.assignment_employees?.map(ae => ae.employees).filter(Boolean) || [];

  // Get selected employee info
  const selectedEmployee = employees.find(e => e?.id_emp === selectedEmployeeId);

  // --- RENDER LOGIC ---

  if (isLoading || isLoadingMission) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">Erreur de chargement</Typography>
        <Typography color="text.secondary">{error.message}</Typography>
      </Card>
    );
  }

  if (!stats || 'noAssignment' in stats) {
    return (
      <Card sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Aucune mission active
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Vous n'avez pas encore été assigné à une mission. Veuillez contacter un administrateur.
        </Typography>
      </Card>
    );
  }

  const hasAbsenceData = Object.keys(stats.absenceBreakdown).length > 0;
  const hasMonthlyData = stats.monthlyActivity.some((month: { name: string; absences: number }) => month.absences > 0);

  return (
    <Box sx={{ animation: `${fadeInUp} 0.5s ease-out` }}>
      {/* Header Card with Employee Selector - Admin Only */}
      {isAdmin && employees.length > 0 && (
        <Card sx={{ 
          mb: 3,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 10px 30px -5px rgba(102, 126, 234, 0.3)',
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 2 
          }}>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                Tableau de bord - {stats.assignment.client_name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<PeopleOutlineIcon sx={{ color: 'white !important' }} />}
                  label={`${employees.length} employé${employees.length > 1 ? 's' : ''}`}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                {stats.assignment.start_date && stats.assignment.end_date && (
                  <Chip 
                    label={`${new Date(stats.assignment.start_date).toLocaleDateString('fr-FR')} - ${new Date(stats.assignment.end_date).toLocaleDateString('fr-FR')}`}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            </Box>
            
            <FormControl 
              size="small"
              sx={{ 
                minWidth: 280,
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
            >
              
              <Select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                label="Vue"
                sx={{
                  color: 'text.primary',
                  bgcolor: 'white',
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                <MenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem' 
                    }}>
                      <PeopleOutlineIcon fontSize="small" />
                    </Avatar>
                    <Typography fontWeight={600}>Tous les employés</Typography>
                  </Box>
                </MenuItem>
                {employees.map((emp) => emp && (
                  <MenuItem key={emp.id_emp} value={emp.id_emp}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: 'secondary.main',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}>
                        {emp.first_name[0]}{emp.last_name[0]}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>
                          {emp.first_name} {emp.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Card>
      )}

      {/* Dashboard Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: 'repeat(4, 1fr)',
          '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
          '@media (max-width: 768px)': { gridTemplateColumns: '1fr' },
        }}
      >
        {/* Total Employees Card - Admin Only */}
        {isAdmin && (
          <Card sx={{ 
            ...cardBaseStyles, 
            gridColumn: 'span 1', 
            animation: `${fadeInUp} 0.5s ease-out 0.1s forwards`, 
            opacity: 0,
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {selectedEmployeeId === 'all' ? 'Équipe Mission' : 'Employé'}
                </Typography>
                <Typography variant="h3" fontWeight="700" sx={{ my: 1 }}>
                  {selectedEmployeeId === 'all' ? stats.totalEmployees : '1'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedEmployeeId === 'all' ? 'employés actifs' : selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : ''}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <PeopleOutlineIcon />
              </Avatar>
            </Box>
          </Card>
        )}

        {/* Days Worked Card */}
        <Card sx={{ 
          ...cardBaseStyles, 
          gridColumn: 'span 1', 
          animation: `${fadeInUp} 0.5s ease-out 0.2s forwards`, 
          opacity: 0,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Jours Travaillés
              </Typography>
              <Typography variant="h3" fontWeight="700" sx={{ my: 1 }}>
                {stats.daysWorked}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                sur {stats.assignment.max_service_days} jours
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
              <WorkIcon />
            </Avatar>
          </Box>
        </Card>

        {/* Leave Taken Card */}
        <Card sx={{ 
          ...cardBaseStyles, 
          gridColumn: 'span 1', 
          animation: `${fadeInUp} 0.5s ease-out 0.3s forwards`, 
          opacity: 0,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Congés Pris
              </Typography>
              <Typography variant="h3" fontWeight="700" sx={{ my: 1 }}>
                {stats.leaveTaken}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                sur {stats.assignment.annual_leave_balance} jours
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
              <BeachAccessIcon />
            </Avatar>
          </Box>
        </Card>

        {/* Days Remaining Card */}
        <Card sx={{
          ...cardBaseStyles,
          gridColumn: 'span 1',
          color: 'white',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          animation: `${fadeInUp} 0.5s ease-out 0.4s forwards`, 
          opacity: 0,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }} fontWeight={600}>
                Jours Restants
              </Typography>
              <Typography variant="h3" fontWeight="700" sx={{ my: 1 }}>
                {stats.daysRemaining}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                avant le maximum
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 48, height: 48 }}>
              <TrendingUpIcon sx={{ color: 'white' }} />
            </Avatar>
          </Box>
        </Card>
        
        {/* Monthly Activity Chart */}
        <Card sx={{ 
          ...cardBaseStyles, 
          gridColumn: { xs: 'span 1', md: 'span 2' }, 
          animation: `${fadeInUp} 0.5s ease-out 0.5s forwards`, 
          opacity: 0 
        }}>
          {hasMonthlyData ? (
            <MonthlyActivityChart data={stats.monthlyActivity} />
          ) : (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Aucune activité mensuelle à afficher.</Typography>
            </Box>
          )}
        </Card>
        
        {/* Absence Pie Chart */}
        <Card sx={{ 
          ...cardBaseStyles, 
          gridColumn: { xs: 'span 1', md: 'span 2' }, 
          animation: `${fadeInUp} 0.5s ease-out 0.6s forwards`, 
          opacity: 0,
          height:  '100%',
        }}>
          {hasAbsenceData ? (
            <AbsencePieChart data={stats.absenceBreakdown} />
          ) : (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Aucune donnée d'absence à afficher.</Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}

export default DashboardPage;
