// src/features/missions/EditMissionModal.tsx
import { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress, Select, MenuItem, Chip, OutlinedInput, FormControl, InputLabel, FormHelperText, Alert } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { parseISO } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { useEmployees } from '../employees/useEmployees';
import { useUpdateMission } from './useMissions';
import { calculateDaysBetween, getYearsInRange } from '../../utils/dateUtils';
import type { Mission } from '../../services/apiMissions';
import { formatDateForDB } from '../../utils/dateUtils';

interface EditMissionModalProps {
  open: boolean;
  handleClose: () => void;
  missionToEdit: Mission | null;
}

interface MissionFormData {
  client_name: string;
  year: number;
  max_service_days: number;
  alert_threshold: number;
  annual_leave_balance: number;
  country_code: string;
  employeeIds: string[];
  start_date: Date | null;
  end_date: Date | null;
}

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

export function EditMissionModal({ open, handleClose, missionToEdit }: EditMissionModalProps) {
  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<MissionFormData>();
  
  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const [calculatedDays, setCalculatedDays] = useState<number | null>(null);
  const [yearsSpanned, setYearsSpanned] = useState<number[]>([]);

  useEffect(() => {
    if (missionToEdit) {
      const defaultValues: MissionFormData = {
        ...missionToEdit,
        employeeIds: missionToEdit.assignment_employees.map((ae) => String(ae.employees?.id_emp || '')),
        start_date: missionToEdit.start_date ? parseISO(missionToEdit.start_date) : null,
        end_date: missionToEdit.end_date ? parseISO(missionToEdit.end_date) : null,
      };
      reset(defaultValues);
    }
  }, [missionToEdit, reset]);

  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateDaysBetween(startDate, endDate);
      const years = getYearsInRange(startDate, endDate);
      setCalculatedDays(days);
      setYearsSpanned(years);
      setValue('year', years[0]);
    } else {
      setCalculatedDays(null);
      setYearsSpanned([]);
    }
  }, [startDate, endDate, setValue]);

  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { isUpdating, updateMission } = useUpdateMission();

  const onSubmit = (data: MissionFormData) => {
    if (!data.start_date || !data.end_date || !missionToEdit) return;

    const missionData = {
      client_name: data.client_name,
      year: data.year,
      max_service_days: data.max_service_days,
      alert_threshold: data.alert_threshold,
      annual_leave_balance: data.annual_leave_balance,
      country_code: data.country_code,
      start_date: formatDateForDB(data.start_date), // CHANGED
      end_date: formatDateForDB(data.end_date),
      mission_duration_days: calculatedDays,
    };
    const employeeIds = data.employeeIds;

    updateMission({ missionId: missionToEdit.id, missionData, employeeIds, yearsToSync: yearsSpanned }, {
      onSuccess: () => handleClose()
    });
  };

  if (!missionToEdit) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6" component="h2" fontWeight={600}>
          Modifier : {missionToEdit.client_name}
        </Typography>
        
        <TextField {...register("client_name", { required: "Ce champ est requis" })} label="Nom du Client" fullWidth error={!!errors.client_name} helperText={errors.client_name?.message as string} />

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

        {calculatedDays !== null && (
          <Alert severity="info">
            <strong>Durée:</strong> {calculatedDays} jours
            {yearsSpanned.length > 1 && <><br /><strong>Années:</strong> {yearsSpanned.join(', ')}</>}
          </Alert>
        )}
        
        <TextField {...register("year", { required: "Ce champ est requis" })} label="Année" type="number" fullWidth error={!!errors.year} helperText={errors.year?.message as string} />
        
        <FormControl fullWidth error={!!errors.employeeIds}>
          <InputLabel>Employés</InputLabel>
          <Controller
            name="employeeIds"
            control={control}
            defaultValue={[]}
            rules={{ required: "Sélectionnez au moins un employé" }}
            render={({ field }) => (
              <Select {...field} multiple input={<OutlinedInput label="Employés" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const employee = employees?.find(e => e.id_emp === id);
                      return <Chip key={id} label={employee ? `${employee.first_name} ${employee.last_name}` : ''} />;
                    })}
                  </Box>
                )}
              >
                {isLoadingEmployees ? <MenuItem disabled>Chargement...</MenuItem> :
                  employees?.map((employee) => (
                    <MenuItem key={employee.id_emp} value={employee.id_emp}>
                      {employee.first_name} {employee.last_name}
                    </MenuItem>
                  ))
                }
              </Select>
            )}
          />
          {errors.employeeIds && <FormHelperText>{errors.employeeIds.message as string}</FormHelperText>}
        </FormControl>

        <TextField {...register("max_service_days")} label="Jours Max" type="number" fullWidth />
        <TextField {...register("alert_threshold")} label="Seuil d'Alerte" type="number" fullWidth />
        <TextField {...register("annual_leave_balance")} label="Congés Annuels" type="number" fullWidth />
        <TextField {...register("country_code")} label="Code Pays" fullWidth />

        <Button type="submit" variant="contained" sx={{ mt: 2, textTransform: 'none', color: 'white', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }}} disabled={isUpdating}>
          {isUpdating ? <CircularProgress size={24} /> : "Sauvegarder les Changements"}
        </Button>
      </Box>
    </Modal>
  );
}
