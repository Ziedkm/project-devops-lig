import { Paper, Box, Typography, Avatar, IconButton, Chip } from '@mui/material';
import { type Employee } from '../../services/apiEmployees'; // Import your Employee type

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  const userInitial = employee.email ? employee.email.charAt(0).toUpperCase() : '?';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>{userInitial}</Avatar>
        <Box>
          <Typography variant="body1" fontWeight="600">
            {employee.first_name} {employee.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employee.email}
          </Typography>
          <Chip
            label={employee.role}
            size="small"
            color={employee.role === 'admin' ? 'primary' : 'default'}
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Box>

      <Box>
        <IconButton onClick={() => onEdit(employee)} aria-label="edit">
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(employee.id_emp)} aria-label="delete">
          <DeleteIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default EmployeeCard;