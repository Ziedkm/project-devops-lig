import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Box, Typography } from '@mui/material';

interface MonthlyActivityChartProps {
  // Expects an array of objects with an 'absences' property
  data: { name: string; absences: number }[];
}

function MonthlyActivityChart({ data }: MonthlyActivityChartProps) {
  // If there's no data or it's empty, display a helpful message.
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No monthly activity to display.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={3}>Activité Mensuelle</Typography>
      <Box sx={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} // Use the data from props
            margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
          >
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} dy={10} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip
              cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="absences" name="Jours d'Absence" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
export default MonthlyActivityChart;