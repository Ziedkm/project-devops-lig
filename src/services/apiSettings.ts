import { supabase } from '../config/supabaseClient';

// Define the shape of the data we need to send to the function
interface SyncHolidaysPayload {
  countryCode: string;
  year: number;
  assignmentId: string;
  userId: string;
}
    
export async function syncPublicHolidays(payload: SyncHolidaysPayload) {
  const { data, error } = await supabase.functions.invoke('sync-holidays', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}