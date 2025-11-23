import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, RadioGroup, FormControlLabel, Radio, Box, FormHelperText } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

interface EntryType {
  id: string;
  name: string;
}

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  selection: { start: string; end: string } | null;
  entryTypes: EntryType[];
}

function AddEventModal({ open, onClose, onSave, selection, entryTypes = [] }: AddEventModalProps) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (open) {
      reset({
        title: '',
        typeId: entryTypes.length > 0 ? entryTypes[0].id : '',
        duration: 'FULL_DAY',
      });
    }
  }, [open, entryTypes, reset]);

  interface FormData {
    title: string;
    typeId: string;
    duration: 'FULL_DAY' | 'AM' | 'PM';
  }

  const onSubmit = (data: FormData) => {
    const eventData = {
      ...data,
      selection: selection,
    };
    onSave(eventData);
  };

  const formattedDate = () => {
    if (!selection) return '';
    const startDate = new Date(selection.start);
    const endDate = new Date(selection.end);
    endDate.setDate(endDate.getDate() - 1);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const startStr = startDate.toLocaleDateString('fr-FR', options);
    if (startDate.getTime() >= endDate.getTime()) return startStr;
    const endStr = endDate.toLocaleDateString('fr-FR', options);
    return `${startStr} - ${endStr}`;
  };

  const isSingleDay = selection ? (new Date(selection.end).getTime() - new Date(selection.start).getTime()) <= 86400000 : false;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      TransitionProps={{ unmountOnExit: true }}
      PaperProps={{
        sx: {
          animation: 'slide-up 0.3s ease-in-out',
          '@keyframes slide-up': {
            from: { transform: 'translateY(10%)', opacity: 0 },
            to: { transform: 'translateY(0)', opacity: 1 },
          },
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle fontWeight={600}>Ajouter une Absence</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}>
          <TextField
            label="Date(s) sélectionnée(s)"
            value={formattedDate()}
            fullWidth
            disabled
            variant="filled"
          />
          <FormControl fullWidth required error={!!errors.typeId}>
            <InputLabel id="absence-type-label">Type d'absence</InputLabel>
            <Controller
              name="typeId"
              control={control}
              rules={{ required: "Ce champ est requis" }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="absence-type-label"
                  label="Type d'absence"
                >
                  {entryTypes.length === 0 && <MenuItem disabled>Chargement...</MenuItem>}
                  {entryTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.typeId && <FormHelperText>{errors.typeId.message as string}</FormHelperText>}
          </FormControl>
          <TextField
            label="Description (Optionnel)"
            fullWidth
            variant="outlined"
            {...register("title")}
          />
          {isSingleDay && (
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  <FormControlLabel value="FULL_DAY" control={<Radio />} label="Journée" />
                  <FormControlLabel value="AM" control={<Radio />} label="Matin" />
                  <FormControlLabel value="PM" control={<Radio />} label="Après-midi" />
                </RadioGroup>
              )}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">Enregistrer</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default AddEventModal;