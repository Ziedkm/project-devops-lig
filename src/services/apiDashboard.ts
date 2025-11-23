// src/services/apiDashboard.ts
import { supabase } from '../config/supabaseClient';
import { getActiveMission } from './apiMissions';
import { eachDayOfInterval, isWeekend, isSameDay, parseISO, getMonth, getYear, isWithinInterval } from 'date-fns';

function getWorkableDaysInInterval(start: Date, end: Date, holidays: Date[]): number {
  if (start > end) return 0;
  const allDays = eachDayOfInterval({ start, end });
  const workableDays = allDays.filter(day => {
    const isHoliday = holidays.some(h => isSameDay(day, h));
    return !isWeekend(day) && !isHoliday;
  });
  return workableDays.length;
}

export async function getDashboardStats(employeeId?: string) {
  const activeMission = await getActiveMission();
  if (!activeMission) {
    return { noAssignment: true };
  }

  // Get current user info
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('employees').select('role').eq('id_emp', user!.id).single();
  const isAdmin = profile?.role === 'admin';

  // Build the query with optional employee filter
  let query = supabase
    .from('day_entries')
    .select('date, entry_types(name)')
    .eq('assignment_id', activeMission.id);

  // If employee ID is provided and user is admin, filter by that employee
  if (employeeId && isAdmin) {
    query = query.eq('employee_id', employeeId);
  } else if (!isAdmin) {
    // If not admin, always filter by current user
    query = query.eq('employee_id', user!.id);
  }

  const { data: dayEntries, error: entriesError } = await query;

  if (entriesError) throw new Error("Impossible de charger les données d'absence.");

  const validDayEntries = dayEntries || [];

  const publicHolidaysAsDates = validDayEntries
    .filter(e => (e.entry_types as any)?.name === 'Jour Férié')
    .map(h => parseISO(h.date));
  const personalAbsences = validDayEntries.filter(e => (e.entry_types as any)?.name !== 'Jour Férié');

  // PRIORITY: Use mission start_date if available
  const today = new Date();
  let effectiveStartDate: Date;
  let effectiveEndDate: Date;

  if (activeMission.start_date && activeMission.end_date) {
    // NEW BEHAVIOR: Use mission date range
    effectiveStartDate = parseISO(activeMission.start_date);
    const missionEndDate = parseISO(activeMission.end_date);
    
    // If mission hasn't started yet, return 0
    if (today < effectiveStartDate) {
      return {
        assignment: activeMission,
        daysWorked: 0,
        leaveTaken: 0,
        sickDays: 0,
        daysRemaining: activeMission.max_service_days,
        absenceBreakdown: {},
        monthlyActivity: Array.from({ length: 12 }, (_, i) => ({
          name: new Date(activeMission.year, i).toLocaleString('fr-FR', { month: 'short' }).replace('.', ''),
          absences: 0
        })),
        totalEmployees: activeMission.assignment_employees?.length || 0,
      };
    }
    
    // Use today if we're still within mission period
    effectiveEndDate = today < missionEndDate ? today : missionEndDate;
  } else {
    // Fallback to old year-based calculation
    const missionYear = activeMission.year;
    const currentYear = getYear(today);
    const startOfYear = new Date(missionYear, 0, 1);
    const endOfYear = new Date(missionYear, 11, 31);
    
    effectiveStartDate = activeMission.first_activation_date 
      ? parseISO(activeMission.first_activation_date)
      : startOfYear;
    
    effectiveEndDate = (missionYear < currentYear) 
      ? endOfYear 
      : (today > endOfYear ? endOfYear : today);
  }

  // Calculate days worked
  const workableDaysInPeriod = getWorkableDaysInInterval(
    effectiveStartDate, 
    effectiveEndDate, 
    publicHolidaysAsDates
  );
  
  const personalAbsencesInPeriod = personalAbsences.filter(a => 
    a.date && isWithinInterval(parseISO(a.date), { 
      start: effectiveStartDate, 
      end: effectiveEndDate 
    })
  ).length;
  
  const daysWorked = workableDaysInPeriod - personalAbsencesInPeriod;
  
  const leaveTaken = personalAbsences.filter(a => (a.entry_types as any)?.name === 'Congé Annuel').length;
  const sickDays = personalAbsences.filter(a => (a.entry_types as any)?.name === 'Maladie').length;
  const daysRemaining = activeMission.max_service_days - daysWorked;

  const absenceBreakdown = personalAbsences.reduce((acc, entry) => {
    const typeName = (entry.entry_types as any)?.name;
    if (typeName) acc[typeName] = (acc[typeName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyActivity = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(activeMission.year, i).toLocaleString('fr-FR', { month: 'short' }).replace('.', ''),
    absences: 0
  }));

  personalAbsences.forEach(entry => {
    if (entry.date) {
      const monthIndex = getMonth(parseISO(entry.date));
      monthlyActivity[monthIndex].absences++;
    }
  });
  
  const totalEmployeesInMission = activeMission.assignment_employees?.length || 0;

  let adminStats = {};
  if (isAdmin) {
    const { count: totalCompanyEmployees } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
    adminStats = { totalCompanyEmployees };
  }

  return {
    assignment: activeMission,
    daysWorked,
    leaveTaken,
    sickDays,
    daysRemaining,
    absenceBreakdown,
    monthlyActivity,
    totalEmployees: totalEmployeesInMission, 
    ...adminStats,
  };
}
