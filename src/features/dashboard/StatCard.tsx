import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  color?: string;
}

function StatCard({ title, value, subtitle, icon, color = '#e0f2fe' }: StatCardProps) {
  return (
    <Card
      elevation={0} // We'll use a custom shadow instead of the default elevation
      sx={{
        borderRadius: 4, // More pronounced rounding
        height: '100%', // Makes the card fill the grid item height
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // A softer, more modern shadow
        border: '1px solid rgba(0,0,0,0.03)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}> {/* Increased padding */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
            {title}
          </Typography>
          <Box sx={{ 
            backgroundColor: color, 
            borderRadius: '50%', 
            width: 48, 
            height: 48, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'primary.main',
          }}>
            {icon}
          </Box>
        </Box>
        
        <Typography variant="h3" fontWeight="700" sx={{ mb: 1 }}>
          {value}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ minHeight: '2.5em' }}> {/* Reserve space for subtitle */}
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;