// src/features/history/HistoryLogRow.tsx
import { Box, Typography, Avatar } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const operationIcons: { [key: string]: { icon: React.ReactElement, color: string } } = {
  'INSERT': { icon: <AddCircleOutlineIcon />, color: 'success.main' },
  'UPDATE': { icon: <EditOutlinedIcon />, color: 'info.main' },
  'DELETE': { icon: <DeleteOutlineIcon />, color: 'error.main' },
};

function HistoryLogRow({ log }: { log: any }) {
  const { icon, color } = operationIcons[log.operation_type] || {};

  const generateLogMessage = () => {
    switch (log.operation_type) {
      case 'INSERT':
        return `New assignment created for client "${log.client_name}" for the year ${log.year}.`;
      case 'UPDATE':
        // In a real app, you would compare old/new values to show what changed
        return `Assignment for client "${log.client_name}" was updated.`;
      case 'DELETE':
        return `Assignment for client "${log.client_name}" was deleted.`;
      default:
        return 'An unknown action occurred.';
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Avatar sx={{ bgcolor: color, width: 32, height: 32 }}>{icon}</Avatar>
      <Box>
        <Typography variant="body1" fontWeight={500}>{generateLogMessage()}</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(log.changed_at).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}

export default HistoryLogRow;