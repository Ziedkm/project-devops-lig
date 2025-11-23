import { Box, Button, Typography, Paper } from '@mui/material';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useUser } from '../hooks/useUser'; // To get the logged-in user's ID
import { supabase } from '../config/supabaseClient'; // Assuming you have a supabase client setup

import { syncPublicHolidays } from '../services/apiSettings';

const getActiveAssignment = async (userId: string) => {
    const { data, error } = await supabase
        .from('assignment_employees')
        .select('assignments(*)')
        .eq('employee_id', userId)
        .limit(1)
        .single();
    if (error) throw new Error("Could not find an active assignment for this user.");
    return data.assignments[0];
}

function SettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useUser();

   const { data: activeAssignment, isLoading: isLoadingAssignment } = useQuery({
        queryKey: ['activeAssignment', user?.id],
        queryFn: () => getActiveAssignment(user!.id),
        enabled: !!user, // Only run if the user is loaded
    });

  // useMutation is the best way to handle actions that change server data
  const { mutate: performSync, isPending: isSyncing } = useMutation({
    mutationFn: syncPublicHolidays,
    onSuccess: (data) => {
      toast.success(data.message || 'Public holidays synced successfully!');
      
      // THIS IS THE MOST IMPORTANT PART:
      // After a successful sync, we tell React Query that the data
      // for the dashboard and calendar is now stale and needs to be refetched.
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
    onError: (err: Error) => {
      toast.error(`Sync failed: ${err.message}`);
    },
  });

  const handleSyncClick = () => {
        if (!user || !activeAssignment) {
            toast.error("Could not find an active assignment. Please ensure you are assigned to a mission.");
            return;
        }
    
     // We now use real, fetched data to build the payload
        const payload = {
            countryCode: activeAssignment.country_code, // e.g., 'FR', 'US', etc. from the DB
            year: activeAssignment.year,
            assignmentId: activeAssignment.id,
            userId: user.id,
        };

    if (!payload.countryCode || payload.countryCode.length !== 2) {
            toast.error(`Invalid Country Code found for this assignment: ${payload.countryCode}`);
            return;
        }

        console.log("Sending payload to Edge Function:", payload); // Add this for debugging
        performSync(payload);
    };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>Settings</Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="h6">Data Synchronization</Typography>
        <Typography color="text.secondary" mb={2}>
          Sync official public holidays for a given year. This will add them to the calendar for all users on the selected assignment.
        </Typography>
        <Button
              variant="contained"
              onClick={handleSyncClick}
              disabled={isSyncing || isLoadingAssignment} // Also disable while fetching the assignment
            >
              {isSyncing ? 'Syncing...' : `Sync ${activeAssignment?.year || ''} Public Holidays (${activeAssignment?.country_code || ''})`}
            </Button>
      </Paper>
    </Box>
  );
}

export default SettingsPage;