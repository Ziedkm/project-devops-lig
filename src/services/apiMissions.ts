// src/services/apiMissions.ts
import { getSupabase } from '../config/supabaseClient';
const supabase = getSupabase();
import { eachDayOfInterval, isWeekend, isSameDay, parseISO, getYear, isWithinInterval } from 'date-fns';

// --- DÉFINITION DES TYPES ---
export interface Mission {
  id: string;
  client_name: string;
  year: number;
  max_service_days: number;
  alert_threshold: number;
  annual_leave_balance: number;
  country_code: string;
  is_active: boolean;
  first_activation_date: string | null;
  is_completed: boolean;
  start_date: string | null;  // NEW
  end_date: string | null;    // NEW
  mission_duration_days: number | null;  // NEW
  assignment_employees: {
    employees: {
      id_emp: string;
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  }[];
}

// --- FONCTIONS UTILITAIRES ---
function getWorkableDaysInInterval(start: Date, end: Date, holidays: Date[]): number {
  if (start > end) return 0;
  const allDays = eachDayOfInterval({ start, end });
  const workableDays = allDays.filter(day => {
    const isHoliday = holidays.some(h => isSameDay(day, h));
    return !isWeekend(day) && !isHoliday;
  });
  return workableDays.length;
}

// --- FONCTIONS API ---
export async function getMissionsWithEmployees(userRole: 'admin' | 'employee'): Promise<Mission[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  if (userRole === 'admin') {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, assignment_employees(employees(*))')
      .order('year', { ascending: false });
    if (error) { console.error(error); return []; }
    return (data as Mission[]) || [];
  } else {
    const { data, error } = await supabase.rpc('get_my_missions_with_teammates');
    if (error) { console.error(error); return []; }
    return (data as Mission[]) || [];
  }
}

export async function deleteMission(missionId: string) {
  const { error } = await supabase.from('assignments').delete().eq('id', missionId);
  if (error) { throw new Error("La mission n'a pas pu être supprimée."); }
  return null;
}

/**
 * Sync holidays for multiple years
 */
export async function syncHolidaysForMission({ 
  missionId, 
  years, 
  countryCode 
}: { 
  missionId: string; 
  years: number[]; 
  countryCode: string;
}) {
  // Create all sync promises in parallel
  const syncPromises = years.map(async (year) => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-holidays', {
        body: { assignmentId: missionId, year, countryCode },
      });
      
      if (error) {
        console.error(`Erreur de synchronisation pour l'année ${year}:`, error);
        return { year, success: false, error: error.message };
      }
      
      return { year, success: true, data };
    } catch (err) {
      console.error(`Erreur inattendue pour l'année ${year}:`, err);
      return { year, success: false, error: (err as Error).message };
    }
  });
  
  // Wait for all syncs to complete in parallel
  const results = await Promise.all(syncPromises);
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  
  // Log results for debugging
  console.log('Holiday sync results:', {
    years,
    successCount,
    failureCount,
    details: results
  });
  
  return {
    message: `Jours fériés synchronisés: ${successCount}/${results.length} année(s)`,
    results,
    allSuccess: failureCount === 0
  };
}

/**
 * Create mission with employees and sync holidays for all years in range
 */
export async function createMissionWithEmployees({ 
  missionData, 
  employeeIds, 
  yearsToSync 
}: { 
  missionData: any; 
  employeeIds: string[];
  yearsToSync?: number[];
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non authentifié");
  
  const completeMissionData = { ...missionData, user_id: user.id };
  
  // Create the mission
  const { data: missionId, error } = await supabase.rpc('create_mission_and_assign_employees', {
    mission_data: completeMissionData,
    employee_ids: employeeIds
  });
  
  if (error) { 
    throw new Error("La mission n'a pas pu être créée."); 
  }
  
  // If we have years to sync, do it now and WAIT for completion
  if (yearsToSync && yearsToSync.length > 0 && missionId) {
    console.log('Starting holiday sync for years:', yearsToSync);
    
    // IMPORTANT: Wait for the sync to complete before returning
    const syncResult = await syncHolidaysForMission({
      missionId: missionId,
      years: yearsToSync,
      countryCode: missionData.country_code
    });
    
    console.log('Holiday sync completed:', syncResult);
    
    // Optional: Throw error if sync failed completely
    if (!syncResult.allSuccess) {
      console.warn('Some holiday syncs failed:', syncResult.results);
      // Don't throw - mission was created successfully
    }
  }
  
  return missionId;
}

/**
 * Update mission and sync holidays if needed
 */
export async function updateMission({ 
  missionId, 
  missionData, 
  employeeIds,
  yearsToSync 
}: { 
  missionId: string; 
  missionData: any; 
  employeeIds: string[];
  yearsToSync?: number[];
}) {
  // Update the mission
  const { error } = await supabase.rpc('update_mission_details', {
    target_mission_id: missionId,
    mission_data: missionData,
    employee_ids: employeeIds
  });
  
  if (error) { 
    throw new Error("La mission n'a pas pu être mise à jour."); 
  }
  
  // If dates changed and we have years to sync, WAIT for completion
  if (yearsToSync && yearsToSync.length > 0) {
    console.log('Re-syncing holidays for years:', yearsToSync);
    
    // First, delete old holiday entries to avoid duplicates
    const { error: deleteError } = await supabase
      .from('day_entries')
      .delete()
      .eq('assignment_id', missionId)
      .in('type_id', [
        // Get the holiday type ID
        (await supabase
          .from('entry_types')
          .select('id')
          .eq('name', 'Jour Férié')
          .single()
        ).data?.id
      ]);
      
    if (deleteError) {
      console.error('Error deleting old holidays:', deleteError);
    }
    
    const syncResult = await syncHolidaysForMission({
      missionId,
      years: yearsToSync,
      countryCode: missionData.country_code
    });
    
    console.log('Holiday re-sync completed:', syncResult);
  }
  
  return null;
}

export async function toggleMissionStatus({ missionId, newStatus }: { missionId: string, newStatus: boolean }) {
  const { error } = await supabase.rpc('toggle_mission_status', {
    target_mission_id: missionId,
    new_status: newStatus
  });
  if (error) {
    if (error.message.includes('one_active_mission_per_user_idx')) {
      throw new Error("Une autre mission est déjà active. Veuillez la désactiver d'abord.");
    }
    throw new Error("Le statut de la mission n'a pas pu être modifié.");
  }
  return null;
}

export async function getActiveMission(): Promise<Mission | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase.from('employees').select('role').eq('id_emp', user.id).single();
  const userRole = profile?.role;
  
  let query;
  if (userRole === 'admin') {
    query = supabase
      .from('assignments')
      .select('*, assignment_employees(employees(*))')
      .eq('is_active', true)
      .eq('user_id', user.id)
      .single();
  } else {
    query = supabase.rpc('get_employee_active_assignment').single();
  }
  
  const { data, error } = await query;
  if (error && error.code !== 'PGRST116') {
    throw new Error("Impossible de récupérer la mission active.");
  }
  return data as Mission | null;
}

export async function getMissionStats(mission: Mission) {
  if (!mission) return { daysWorked: 0, progression: '0.0' };
  
  const { data: dayEntries, error } = await supabase
    .from('day_entries')
    .select('date, entry_types(name)')
    .eq('assignment_id', mission.id);
    
  if (error) return { daysWorked: 'N/A', progression: 'N/A' };

  const today = new Date();
  
  // PRIORITIZE mission start_date over first_activation_date
  let effectiveStartDate: Date;
  let effectiveEndDate: Date;
  
  if (mission.start_date && mission.end_date) {
    // Use mission date range (NEW BEHAVIOR)
    effectiveStartDate = parseISO(mission.start_date);
    const missionEndDate = parseISO(mission.end_date);
    
    // If mission hasn't started yet, return 0
    if (today < effectiveStartDate) {
      return { daysWorked: 0, progression: '0.0' };
    }
    
    // Use today if we're still within the mission period, otherwise use end date
    effectiveEndDate = today < missionEndDate ? today : missionEndDate;
  } else {
    // Fallback to old year-based calculation for legacy missions
    const missionYear = mission.year;
    const currentYear = getYear(today);
    const startOfYear = new Date(missionYear, 0, 1);
    const endOfYear = new Date(missionYear, 11, 31);
    
    effectiveStartDate = mission.first_activation_date 
      ? parseISO(mission.first_activation_date) 
      : startOfYear;
    
    effectiveEndDate = (missionYear < currentYear) 
      ? endOfYear 
      : (today > endOfYear ? endOfYear : today);
  }

  // Calculate days worked
  const holidaysAsDates = (dayEntries || [])
    .filter(e => (e.entry_types as any)?.name === 'Jour Férié')
    .map(h => parseISO(h.date));
    
  const personalAbsences = (dayEntries || [])
    .filter(e => (e.entry_types as any)?.name !== 'Jour Férié');
    
  const workableDaysInPeriod = getWorkableDaysInInterval(
    effectiveStartDate, 
    effectiveEndDate, 
    holidaysAsDates
  );
  
  const personalAbsencesInPeriod = personalAbsences.filter(a => 
    isWithinInterval(parseISO(a.date), { 
      start: effectiveStartDate, 
      end: effectiveEndDate 
    })
  ).length;
  
  const daysWorked = workableDaysInPeriod - personalAbsencesInPeriod;
  
  const progression = mission.max_service_days > 0 
    ? (daysWorked / mission.max_service_days * 100).toFixed(1) 
    : '0.0';
  
  return {
    daysWorked,
    progression,
  };
}
