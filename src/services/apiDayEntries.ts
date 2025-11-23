// src/services/apiDayEntries.ts
import { supabase } from '../config/supabaseClient';

/**
 * Récupère toutes les entrées de jours pour une mission donnée.
 * Pour les admins, elle récupère aussi les infos de l'employé associé.
 * Pour un employé standard, elle ne récupère que ses propres absences.
 */
export async function getDayEntries(assignmentId: string, employeeId: string, role: 'admin' | 'employee') {
  let query = supabase
    .from('day_entries')
    .select(`
      id,
      date,
      notes,
      duration,
      entry_types ( name ),
      employees ( first_name, last_name )
    `)
    .eq('assignment_id', assignmentId);

  // Si l'utilisateur n'est pas un admin, on filtre pour ne voir que ses propres entrées
  if (role !== 'admin') {
    query = query.eq('employee_id', employeeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erreur API (getDayEntries):', error);
    throw new Error("Les événements du calendrier n'ont pas pu être chargés.");
  }
  return data;
}

/**
 * Récupère la liste de tous les types d'absences possibles.
 */
export async function getEntryTypes() {
  const { data, error } = await supabase
    .from('entry_types')
    .select('id, name');

  if (error) {
    console.error('Erreur API (getEntryTypes):', error);
    throw new Error("Les types d'absences n'ont pas pu être chargés.");
  }
  return data;
}

/**
 * Crée une ou plusieurs nouvelles entrées d'absence.
 */
export async function createDayEntries(newEntries: any[]) {
  if (!newEntries || newEntries.length === 0) {
    throw new Error("Aucune absence à créer.");
  }
  
  const { data, error } = await supabase
    .from('day_entries')
    .insert(newEntries)
    .select();

  if (error) {
    console.error('Erreur API (createDayEntries):', error);
    throw new Error("L'absence n'a pas pu être enregistrée.");
  }
  return data;
}

/**
 * Supprime une entrée d'absence par son ID.
 */
export async function deleteDayEntry(id: string) {
  const { error } = await supabase.from('day_entries').delete().eq('id', id);

  if (error) {
    console.error('Erreur API (deleteDayEntry):', error);
    throw new Error("L'absence n'a pas pu être supprimée.");
  }
  return null;
}