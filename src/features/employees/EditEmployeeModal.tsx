// src/features/employees/EditEmployeeModal.tsx

import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { type Employee } from '../../services/apiEmployees'; // Import the Employee type

interface EditEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (employeeData: { id: string; data: Partial<Employee> }) => void;
  isSaving: boolean;
  employeeToEdit: Employee | null;
}

function EditEmployeeModal({ open, onClose, onSave, isSaving, employeeToEdit }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', role: 'employee' });

  // Lorsque la prop employeeToEdit change, mettez à jour l'état du formulaire
  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        firstName: employeeToEdit.first_name,
        lastName: employeeToEdit.last_name,
        role: employeeToEdit.role,
      });
    }
  }, [employeeToEdit]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!employeeToEdit) return;

    const updatedData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: formData.role as 'admin' | 'employee',
    };
    onSave({ id: employeeToEdit.id_emp, data: updatedData });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle fontWeight={600}>Modifier l'employé</DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <TextField
          autoFocus margin="dense" name="firstName" label="Prénom" type="text"
          fullWidth variant="outlined" required
          value={formData.firstName} onChange={handleChange}
        />
        <TextField
          margin="dense" name="lastName" label="Nom" type="text"
          fullWidth variant="outlined" required
          value={formData.lastName} onChange={handleChange}
        />
        {/* L'e-mail n'est généralement pas modifiable */}
        <TextField
          margin="dense" label="Adresse e-mail" type="email" fullWidth variant="outlined"
          value={employeeToEdit?.email || ''} disabled
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Rôle</InputLabel>
          <Select name="role" label="Rôle" value={formData.role} onChange={handleChange}>
            <MenuItem value="employee">Employé</MenuItem>
            <MenuItem value="admin">Administrateur</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 16px' }}>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving} sx={{ textTransform: 'none', bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default EditEmployeeModal;