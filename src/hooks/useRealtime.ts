// src/hooks/useRealtime.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabaseClient';

export function useRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // On crée un "canal" de communication pour les changements sur les missions
    const channel = supabase
      .channel('public:assignments')
      .on(
        'postgres_changes', // On écoute tous les changements de la base de données
        { event: '*', schema: 'public', table: 'assignments' }, // Pour tous les événements (INSERT, UPDATE, DELETE) sur la table 'assignments'
        (payload) => {
          console.log('Changement temps réel détecté sur les missions !', payload);
          // On dit à react-query que les données 'missions' et 'dashboardStats' sont obsolètes
          queryClient.invalidateQueries({ queryKey: ['missions'] });
          queryClient.invalidateQueries({ queryKey: ['missionStats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        }
      )
      .subscribe();

    // On fait la même chose pour les absences
    const dayEntriesChannel = supabase
      .channel('public:day_entries')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'day_entries' },
        (payload) => {
          console.log('Changement temps réel détecté sur les absences !', payload);
          queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
          queryClient.invalidateQueries({ queryKey: ['missionStats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        }
      )
      .subscribe();

    // C'est très important de se désabonner quand le composant n'est plus à l'écran
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(dayEntriesChannel);
    };
  }, [queryClient]);
}