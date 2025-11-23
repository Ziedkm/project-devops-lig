import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

// Define a consistent color map for absence types
const TYPE_COLORS: { [key: string]: string } = {
  'Absence Autorisée': '#4f46e5',      // Indigo
  'Maladie': '#f97316',    // Orange
  'Jours Fériés': '#10b981', // Green
  'PERSONAL': '#eab308',     // Amber
  'Congé Annuel': '#3b82f6',    // Blue
  // Add other types and colors as needed
};

// Define the shape of the data prop we expect
interface AbsencePieChartProps {
  data: Record<string, number>;

}

function AbsencePieChart({ data }: AbsencePieChartProps) {
  // --- DATA TRANSFORMATION ---
  // Convert the incoming object into an array of objects that Recharts can use.
  // Example: { "VACATION": 8 } becomes [{ name: "VACATION", value: 8 }]
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1), // Capitalize for display
    value,
  }));

  // If there's no data, display a helpful message instead of an empty chart
  if (chartData.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No absence data to display.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={3}>Répartition des Absences</Typography>
      <Box sx={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
            <Pie
              data={chartData} // Use the transformed data
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                // Use our color map to assign a consistent color to each absence type
                <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || '#cccccc'} />
                
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default AbsencePieChart;