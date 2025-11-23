// src/features/history/HistoryTimeline.tsx
import { 
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { Box, Typography, Paper, Chip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { HistoryLog } from '../../services/apiHistory';

const operationConfig = {
  INSERT: {
    icon: <AddCircleOutlineIcon />,
    color: 'success' as const,
    label: 'Création',
    bgcolor: '#e8f5e9',
  },
  UPDATE: {
    icon: <EditOutlinedIcon />,
    color: 'info' as const,
    label: 'Modification',
    bgcolor: '#e3f2fd',
  },
  DELETE: {
    icon: <DeleteOutlineIcon />,
    color: 'error' as const,
    label: 'Suppression',
    bgcolor: '#ffebee',
  },
};

function HistoryTimeline({ logs }: { logs: HistoryLog[] }) {
  const generateMessage = (log: HistoryLog) => {
    const clientName = log.client_name || 'Client inconnu';
    switch (log.operation_type) {
      case 'INSERT':
        return `Nouvelle mission créée pour le client "${clientName}"`;
      case 'UPDATE':
        return `Mission "${clientName}" modifiée`;
      case 'DELETE':
        return `Mission "${clientName}" supprimée`;
      default:
        return 'Action inconnue';
    }
  };

  const generateDetails = (log: HistoryLog) => {
    return [
      { label: 'Année', value: log.year ?? 'N/A' },
      { label: 'Jours max', value: log.max_service_days ?? 'N/A' },
      { label: 'Seuil', value: log.alert_threshold ?? 'N/A' },
      { label: 'Pays', value: log.country_code ?? 'N/A' },
    ];
  };

  return (
    <Timeline position="right" sx={{ p: 0, m: 0 }}>
      {logs.map((log, index) => {
        const config = operationConfig[log.operation_type];
        const isLast = index === logs.length - 1;

        if (!config) return null;

        return (
          <TimelineItem key={log.history_id}>
            <TimelineOppositeContent
              sx={{ 
                flex: 0.3, 
                py: 2,
                pr: 2,
                textAlign: 'right',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                {format(new Date(log.changed_at), 'dd MMM yyyy', { locale: fr })}
              </Typography>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {format(new Date(log.changed_at), 'HH:mm')}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatDistanceToNow(new Date(log.changed_at), { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot 
                color={config.color} 
                sx={{ 
                  boxShadow: `0 0 0 4px ${config.bgcolor}`,
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {config.icon}
                
              </TimelineDot>
              {!isLast && <TimelineConnector sx={{ bgcolor: 'grey.300' }} />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: 2, px: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  bgcolor: config.bgcolor,
                  border: `1px solid ${config.color}.200`,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Chip 
                    label={config.label} 
                    color={config.color} 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Typography variant="body1" fontWeight={600} gutterBottom>
                  {generateMessage(log)}
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1.5, 
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid rgba(0,0,0,0.08)',
                }}>
                  {generateDetails(log).map((detail) => (
                    <Box key={detail.label}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {detail.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {detail.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

export default HistoryTimeline;
