// src/features/missions/useMissions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getMissionsWithEmployees, 
  deleteMission as deleteMissionApi,
  syncHolidaysForMission,
  createMissionWithEmployees,
  updateMission as updateMissionApi,
  toggleMissionStatus,
  getMissionStats,
  type Mission 
} from '../../services/apiMissions';

export function useMissions() {
  const { employee } = useAuth();
  const userRole = employee?.role;
  const { data: missions, isLoading, error } = useQuery({
    queryKey: ['missions', userRole],
    queryFn: () => getMissionsWithEmployees(userRole as 'admin' | 'employee'),
    enabled: !!userRole,
  });

  if (error) {
    toast.error("Impossible de charger les missions.");
  }

  return { missions, isLoading, error };
}

export function useDeleteMission() {
  const queryClient = useQueryClient();
  const { isPending: isDeleting, mutate: deleteMissionMutate } = useMutation({
    mutationFn: deleteMissionApi,
    onSuccess: () => {
      toast.success('Mission supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['missions'] }); 
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { isDeleting, deleteMission: deleteMissionMutate };
}

export function useSyncHolidays() {
  const queryClient = useQueryClient();
  const { isPending: isSyncing, mutate: syncHolidaysMutate } = useMutation({
    mutationFn: syncHolidaysForMission,
    onSuccess: (data: any) => {
      if (data.allSuccess) {
        toast.success(data.message);
      } else {
        toast(data.message, {
          icon: '⚠️',
          style: {
            background: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeaa7',
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: ['missionStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { isSyncing, syncHolidays: syncHolidaysMutate };
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  const { isPending: isCreating, mutate: createMission } = useMutation({
    mutationFn: createMissionWithEmployees, 
    onSuccess: () => {
      toast.success("Nouvelle mission créée avec succès !");
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { isCreating, createMission };
}

export function useUpdateMission() {
  const queryClient = useQueryClient();
  const { isPending: isUpdating, mutate: updateMissionMutate } = useMutation({
    mutationFn: updateMissionApi,
    onSuccess: () => {
      toast.success("Mission mise à jour avec succès !");
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { isUpdating, updateMission: updateMissionMutate };
}

export function useToggleMissionStatus() {
  const queryClient = useQueryClient();
  const { isPending: isToggling, mutate: toggleStatus } = useMutation({
    mutationFn: toggleMissionStatus,
    onSuccess: () => {
      toast.success("Statut de la mission mis à jour.");
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  return { isToggling, toggleStatus };
}

export function useMissionStats(mission: Mission) {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['missionStats', mission?.id], 
    queryFn: () => getMissionStats(mission),
    enabled: !!mission?.id,
  });
  return { stats, isLoadingStats };
}
