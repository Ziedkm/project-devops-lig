// src/services/apiHistory.ts
import { getSupabase } from '../config/supabaseClient';
const supabase = getSupabase();

export interface HistoryLog {
  history_id: string;
  id: string;
  created_at: string;
  client_name: string | null;
  year: number | null;
  max_service_days: number | null;
  alert_threshold: number | null;
  annual_leave_balance: number | null;
  country_code: string | null;
  user_id: string | null;
  operation_type: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_at: string;
}

interface HistoryFilters {
  operationType: string | null;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

export async function getHistoryLog({ operationType, dateRange }: HistoryFilters) {
  let query = supabase
    .from('assignments_history')
    .select('*')
    .order('changed_at', { ascending: false });

  if (operationType) {
    query = query.eq('operation_type', operationType);
  }
  
  if (dateRange.startDate) {
    query = query.gte('changed_at', dateRange.startDate.toISOString());
  }
  
  if (dateRange.endDate) {
    const inclusiveEndDate = new Date(dateRange.endDate);
    inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
    query = query.lt('changed_at', inclusiveEndDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Action history could not be loaded: ${error.message}`);
  }
  
  return data as HistoryLog[];
}
