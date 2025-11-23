// src/features/missions/AddMissionModal.tsx
import { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress, Select, MenuItem, Chip, OutlinedInput, FormControl, InputLabel, FormHelperText, Alert } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { useForm, Controller } from 'react-hook-form';
import { useEmployees } from '../employees/useEmployees';
import { useCreateMission } from './useMissions';
import { calculateDaysBetween, getYearsInRange } from '../../utils/dateUtils';
import { formatDateForDB } from '../../utils/dateUtils';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2
};

interface AddMissionModalProps {
  open: boolean;
  handleClose: () => void;
}

interface IFormInput {
  client_name: string;
  year: number;
  employeeIds: string[];
  max_service_days: number;
  alert_threshold: number;
  annual_leave_balance: number;
  country_code: string;
  start_date: Date | null;
  end_date: Date | null;
}

export function AddMissionModal({ open, handleClose }: AddMissionModalProps) {
  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<IFormInput>({
    defaultValues: {
      start_date: null,
      end_date: null,
      max_service_days: 210,
      alert_threshold: 195,
      annual_leave_balance: 25,
      country_code: 'FR',
    }
  });
  
  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { isCreating, createMission } = useCreateMission();

  // Watch date changes
  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const [calculatedDays, setCalculatedDays] = useState<number | null>(null);
  const [yearsSpanned, setYearsSpanned] = useState<number[]>([]);

  // Calculate days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateDaysBetween(startDate, endDate);
      const years = getYearsInRange(startDate, endDate);
      setCalculatedDays(days);
      setYearsSpanned(years);
      
      // Auto-fill the year field with start year
      setValue('year', years[0]);
    } else {
      setCalculatedDays(null);
      setYearsSpanned([]);
    }
  }, [startDate, endDate, setValue]);

  const onSubmit = (data: IFormInput) => {
    if (!data.start_date || !data.end_date) {
      return;
    }

    const missionData = {
      client_name: data.client_name,
      year: data.year,
      max_service_days: data.max_service_days,
      alert_threshold: data.alert_threshold,
      annual_leave_balance: data.annual_leave_balance,
      country_code: data.country_code,
      start_date: formatDateForDB(data.start_date), // CHANGED
      end_date: formatDateForDB(data.end_date), // CHANGED
      mission_duration_days: calculatedDays,
    };
    const employeeIds = data.employeeIds;

    createMission({ missionData, employeeIds, yearsToSync: yearsSpanned }, {
      onSuccess: () => handleClose()
    });
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6" component="h2" fontWeight={600}>
          Créer une Nouvelle Mission
        </Typography>
        
        <TextField 
          {...register("client_name", { required: "Ce champ est requis" })} 
          label="Nom du Client" 
          fullWidth 
          error={!!errors.client_name} 
          helperText={errors.client_name?.message as string} 
        />

        {/* Date Range Selection */}
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Controller
            name="start_date"
            control={control}
            rules={{ required: "La date de début est requise" }}
            render={({ field }) => (
              <DatePicker
                label="Date de début"
                value={field.value}
                onChange={(date) => field.onChange(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.start_date,
                    helperText: errors.start_date?.message as string,
                  }
                }}
              />
            )}
          />

          <Controller
            name="end_date"
            control={control}
            rules={{ 
              required: "La date de fin est requise",
              validate: (value) => {
                if (!value || !startDate) return true;
                return value > startDate || "La date de fin doit être après la date de début";
              }
            }}
            render={({ field }) => (
              <DatePicker
                label="Date de fin"
                value={field.value}
                onChange={(date) => field.onChange(date)}
                minDate={startDate || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.end_date,
                    helperText: errors.end_date?.message as string,
                  }
                }}
              />
            )}
          />
        </LocalizationProvider>

        {/* Display calculated duration */}
        {calculatedDays !== null && (
          <Alert severity="info" sx={{ mt: 1 }}>
            <strong>Durée de la mission:</strong> {calculatedDays} jours calendaires
            {yearsSpanned.length > 1 && (
              <><br /><strong>Années concernées:</strong> {yearsSpanned.join(', ')}</>
            )}
          </Alert>
        )}
        
        <TextField 
          {...register("year", { 
            required: "Ce champ est requis",
            valueAsNumber: true,
          })} 
          label="Année de référence" 
          type="number" 
          fullWidth
          error={!!errors.year} 
          helperText={errors.year?.message as string || "Rempli automatiquement selon la date de début"} 
        />
        
        <FormControl fullWidth error={!!errors.employeeIds}>
          <InputLabel>Employés</InputLabel>
          <Controller
            name="employeeIds"
            control={control}
            defaultValue={[]}
            rules={{ required: "Sélectionnez au moins un employé" }}
            render={({ field }) => (
              <Select
                {...field}
                multiple
                input={<OutlinedInput label="Employés" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((id) => {
                      const employee = employees?.find(e => e.id_emp === id);
                      return <Chip key={id} label={employee ? `${employee.first_name} ${employee.last_name}` : id} />;
                    })}
                  </Box>
                )}
              >
                {isLoadingEmployees ? <CircularProgress /> : employees?.map((employee) => (
                  <MenuItem key={employee.id_emp} value={employee.id_emp}>
                    {`${employee.first_name} ${employee.last_name}`}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.employeeIds && <FormHelperText>{errors.employeeIds.message as string}</FormHelperText>}
        </FormControl>

        <TextField 
          {...register("max_service_days", { valueAsNumber: true })} 
          label="Jours de Service Maximum" 
          type="number" 
          fullWidth 
          defaultValue={210} 
        />
        
        <TextField 
          {...register("alert_threshold", { valueAsNumber: true })} 
          label="Seuil d'Alerte" 
          type="number" 
          fullWidth 
          defaultValue={195} 
        />
        
        <TextField 
          {...register("annual_leave_balance", { valueAsNumber: true })} 
          label="Solde de Congés Annuels" 
          type="number" 
          fullWidth 
          defaultValue={25} 
        />
        
        <TextField 
          {...register("country_code")} 
          label="Code Pays" 
          fullWidth 
          defaultValue={"FR"} 
          helperText="Utilisé pour synchroniser les jours fériés"
        />

        <Button 
          type="submit" 
          variant="contained" 
          sx={{ mt: 2, textTransform: 'none', color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }} 
          disabled={isCreating}
        >
          {isCreating ? <CircularProgress size={24} /> : "Créer la Mission"}
        </Button>
      </Box>
    </Modal>
  );
}
