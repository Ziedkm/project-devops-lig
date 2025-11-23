// src/pages/CalendarPage.tsx
import { useState, useRef, useMemo, useEffect, type ReactElement } from 'react'; // Re-added useRef, useEffect, ReactElement
import FullCalendar from '@fullcalendar/react';
// Added useMediaQuery and useTheme to determine screen size
import { Box, Paper, Typography, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import MainCalendar from '../features/calendar/MainCalendar';
import AddEventModal from '../features/calendar/AddEventModal';
import { getDayEntries, createDayEntries, deleteDayEntry, getEntryTypes } from '../services/apiDayEntries';
import { useAuth } from '../contexts/AuthContext';
import { useActiveMission } from '../features/missions/useActiveMission';

// --- VISUAL MAPS ---
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PublicIcon from '@mui/icons-material/Public';
import WorkIcon from '@mui/icons-material/Work';

const eventVisualsMap: { [key: string]: { main: string; text: string; icon: ReactElement } } = {
  'Congé Annuel':   { main: '#E0F2FE', text: '#0284C7', icon: <BeachAccessIcon sx={{ fontSize: 16 }} /> },
  'Maladie':        { main: '#FEE2E2', text: '#DC2626', icon: <MedicalServicesIcon sx={{ fontSize: 16 }} /> },
  'Jour Férié':   { main: '#D1FAE5', text: '#059669', icon: <PublicIcon sx={{ fontSize: 16 }} /> },
  'Congé Paternité':{ main: '#FEF3C7', text: '#D97706', icon: <WorkIcon sx={{ fontSize: 16 }} /> },
  'Absence Autorisée':{ main: '#EDE9FE', text: '#5B21B6', icon: <WorkIcon sx={{ fontSize: 16 }} /> },
};


// Sous-composant pour ne charger le calendrier que lorsque la session est prête
function CalendarView() {
  // 1. RE-ADD useRef to get a handle on the FullCalendar instance
  const calendarRef = useRef<FullCalendar>(null);
  const queryClient = useQueryClient();
  const { employee } = useAuth();
  const { activeMission } = useActiveMission();
  const currentAssignmentId = activeMission!.id;
  
  // ADDED: Hook to check for mobile screen size for the isMobile prop
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [modalOpen, setModalOpen] = useState(false);
  const [selection, setSelection] = useState<{ start: string; end: string } | null>(null);

  const { data: rawEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['calendarEvents', currentAssignmentId],
    queryFn: () => getDayEntries(currentAssignmentId, employee!.id_emp, employee!.role as 'admin' | 'employee'),
  });

  const { data: entryTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['entryTypes'],
    queryFn: getEntryTypes,
  });

  const { mutate: createEntries } = useMutation({
    mutationFn: createDayEntries,
    onSuccess: () => {
      toast.success("Absence(s) ajoutée(s) avec succès !");
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setModalOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });
  
  const { mutate: performDelete } = useMutation({
    mutationFn: deleteDayEntry,
    onSuccess: () => {
      toast.success("Absence supprimée !");
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const formattedEvents = useMemo(() => {
    if (!rawEvents) return [];
    return rawEvents.map(e => {
      const entryType = Array.isArray(e.entry_types) ? e.entry_types[0] : e.entry_types;
      const typeName = (entryType as { name: string } | null)?.name || 'Inconnu';
      const visuals = eventVisualsMap[typeName] || { main: '#cccccc', text: '#000000', icon: <></> };
      let eventTitle = e.notes || typeName;
      if (employee?.role === 'admin' && e.employees) {
        const employeeData = Array.isArray(e.employees) ? e.employees[0] : e.employees;
        const employees = employeeData as { first_name: string; last_name: string } | null;
        const employeeName = `${employees?.first_name || ''} ${employees?.last_name || ''}`.trim();
        eventTitle = employeeName ? `${employeeName}: ${eventTitle}` : eventTitle;
      }
      const finalTitle = `${eventTitle}${e.duration !== 'FULL_DAY' ? ` (${e.duration})` : ''}`;
      return {
        id: e.id,
        title: finalTitle,
        date: e.date,
        backgroundColor: visuals.main,
        borderColor: visuals.main,
        textColor: visuals.text,
        extendedProps: {
          title: finalTitle,
          icon: visuals.icon,
          duration: e.duration,
        }
      };
    });
  }, [rawEvents, employee?.role]);

  // 2. RE-ADD useEffect to programmatically change the date when the mission changes.
  useEffect(() => {
    if (calendarRef.current && activeMission?.year) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(`${activeMission.year}-01-01`);
    }
  }, [activeMission]);
  
  const handleDateClick = (arg: { dateStr: string }) => {
    const endDate = new Date(arg.dateStr);
    endDate.setDate(endDate.getDate() + 1);
    setSelection({ start: arg.dateStr, end: endDate.toISOString().split('T')[0] });
    setModalOpen(true);
  };
  
  const handleDateSelect = (selectionInfo: { startStr: string; endStr: string }) => {
    setSelection({ start: selectionInfo.startStr, end: selectionInfo.endStr });
    setModalOpen(true);
  };
  
  const handleCreateClick = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    setSelection({ start: todayStr, end: tomorrowStr });
    setModalOpen(true);
  };

  const handleSaveEvent = (data: { title: string | null; typeId: string; duration: string; }) => {
    if (!selection || !employee || !currentAssignmentId) {
      toast.error("Impossible de sauvegarder : données de session manquantes.");
      return;
    }
    const targetEmployeeId = employee.id_emp;
    const startDate = new Date(selection.start);
    const endDate = new Date(selection.end);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);
    const entriesToCreate = [];
    for (let d = startDate.getTime(); d < endDate.getTime(); d += 86400000) {
      entriesToCreate.push({ date: new Date(d).toISOString().split('T')[0], notes: data.title, type_id: data.typeId, assignment_id: currentAssignmentId, employee_id: targetEmployeeId, duration: (endDate.getTime() - startDate.getTime()) > 86400000 ? 'FULL_DAY' : data.duration });
    }
    if (entriesToCreate.length > 0) createEntries(entriesToCreate);
    else setModalOpen(false);
  };
  
  const handleEventClick = (clickInfo: any) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement '${clickInfo.event.title}' ?`)) {
      performDelete(clickInfo.event.id);
    }
  };
  
  if (isLoadingEvents || isLoadingTypes) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  return (
    <>
      <Box sx={{ height: 'calc(100vh - 100px)' }}>
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 3 }, border: '1px solid #e5e7eb', height: '100%' }}>
          {/* 3. UPDATE the props passed to MainCalendar */}
          <MainCalendar
            ref={calendarRef} // Use the ref prop
            isMobile={isMobile} // Add the missing isMobile prop
            events={formattedEvents}
            onDateClick={handleDateClick}
            onDateSelect={handleDateSelect}
            onCreateClick={handleCreateClick}
            onEventClick={handleEventClick}
          />
        </Paper>
      </Box>
      {modalOpen && <AddEventModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveEvent} selection={selection} entryTypes={entryTypes || []} />}
    </>
  );
}

// Composant parent qui gère le chargement initial
function CalendarPage() {
  const { employee, isLoading: isLoadingAuth } = useAuth();
  const { activeMission, isLoadingActiveMission } = useActiveMission();

  if (isLoadingAuth || isLoadingActiveMission) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }
  
  if (!employee) {
    return <Paper sx={{p: 4, textAlign: 'center', m: 3}}><Typography>Impossible de charger le profil de l'employé.</Typography></Paper>;
  }

  if (!activeMission) {
    return <Paper sx={{p: 4, textAlign: 'center', m: 3}}><Typography>Veuillez activer une mission pour voir le calendrier.</Typography></Paper>;
  }

  return <CalendarView />;
}

export default CalendarPage;