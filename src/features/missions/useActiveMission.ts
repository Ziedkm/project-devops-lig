// src/features/missions/useActiveMission.ts
import { useQuery } from '@tanstack/react-query';
import { getActiveMission } from '../../services/apiMissions';

export function useActiveMission() {
  const { 
    data: activeMission, 
    isLoading: isLoadingActiveMission, 
    error: activeMissionError 
  } = useQuery({
    queryKey: ['missions', 'active'],
    queryFn: getActiveMission,
  });

  return { activeMission, isLoadingActiveMission, activeMissionError };
}