// src/features/employees/AddEmployeeModal.tsx
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (newEmployee: any) => void;
  isSaving: boolean;
}

function AddEmployeeModal({ open, onClose, onSave, isSaving }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', firstName: '', lastName: '', role: 'employee', password: '' });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle fontWeight={600}>Ajouter un nouvel employé</DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <TextField
          autoFocus
          margin="dense"
          name="firstName"
          label="Prénom"
          type="text"
          fullWidth
          variant="outlined"
          required
          value={formData.firstName}
          onChange={handleChange}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
        <TextField
          margin="dense"
          name="lastName"
          label="Nom"
          type="text"
          fullWidth
          variant="outlined"
          required
          value={formData.lastName}
          onChange={handleChange}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
        <TextField
          margin="dense"
          name="email"
          label="Adresse e-mail"
          type="email"
          fullWidth
          variant="outlined"
          required
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          margin="dense"
          name="password"
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          variant="outlined"
          required
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password || 'Minimum 6 caractères'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Rôle</InputLabel>
          <Select
            name="role"
            label="Rôle"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="employee">Employé</MenuItem>
            <MenuItem value="admin">Administrateur</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 16px' }}>
        <Button onClick={handleClose}>Annuler</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSaving}
          sx={{
            textTransform: 'none',
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          {isSaving ? 'Ajout en cours...' : 'Ajouter l\'employé'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddEmployeeModal;
