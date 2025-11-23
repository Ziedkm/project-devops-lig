import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabaseClient'; // Adjust path if needed

const fetchUserAndProfile = async () => {
  // 1. Get the current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);

  // If there is no session, we are done. The user is not logged in.
  if (!session) return null;

  // 2. If there is a session, get the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('employees')
    .select('role') // We only need the role for authorization
    .eq('id_emp', session.user.id)
    .single();

  // If there's an error fetching the profile (e.g., RLS), throw it.
  if (profileError) throw new Error(profileError.message);

  // 3. Return a simplified, combined user object
  return {
    id: session.user.id,
    email: session.user.email,
    isAuthenticated: true,
    role: profile?.role || null, // Return the role, or null if no profile was found
  };
};

export function useUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUserAndProfile,
  });

  return {
    isLoading,
    user: data,
    isAuthenticated: data?.isAuthenticated ?? false,
    role: data?.role,
    error,
  };
}