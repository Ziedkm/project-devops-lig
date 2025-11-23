// src/services/apiEmployees.ts
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient';

// Création d'un client admin SÉCURISÉ. Ne l'utilise QUE pour les opérations admin.
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY!
);

export interface Employee {
  id_emp: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'employee';
}

export interface NewEmployeeData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'employee';
  password: string; // Now required
}


export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from('employees').select('*');
  if (error) {
    console.error("Erreur Supabase (getEmployees):", error);
    throw new Error('Les employés n\'ont pas pu être chargés.');
  }
  return data || [];
}

export async function deleteEmployee(id: string) {
  // On appelle une fonction RPC pour supprimer à la fois l'employé ET l'utilisateur Auth
  const { error } = await supabase.rpc('delete_user_and_employee', { target_user_id: id });
  if (error) {
    console.error("Erreur RPC (deleteEmployee):", error);
    throw new Error("L'employé n'a pas pu être supprimé.");
  }
}

// --- FONCTION DE CRÉATION CORRIGÉE ---
export async function createEmployee(newEmployee: NewEmployeeData) {
  // Validate password
  if (!newEmployee.password || newEmployee.password.length < 6) {
    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
  }

  // Create user in Supabase Auth with user_metadata
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: newEmployee.email,
    password: newEmployee.password,
    email_confirm: true,
    user_metadata: {
      first_name: newEmployee.firstName,   // Transform here
      last_name: newEmployee.lastName,     // Transform here
      role: newEmployee.role,
    }
  });

  if (authError) {
    console.error("Erreur de création Auth:", authError);
    throw new Error(`Impossible de créer l'utilisateur : ${authError.message}`);
  }

  // The trigger will automatically create the employee record
  // Wait a moment for the trigger to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Verify the employee was created
  const { data: employee, error: checkError } = await supabase
    .from('employees')
    .select('*')
    .eq('id_emp', authData.user.id)
    .single();

  if (checkError || !employee) {
    console.error("Erreur de vérification:", checkError);
    throw new Error('L\'employé a été créé mais la vérification a échoué');
  }

  return authData.user;
}


export async function updateEmployee({ id, data }: { id: string, data: Partial<Employee> }) {
  const { error } = await supabase
    .from('employees')
    .update(data)
    .eq('id_emp', id);

  if (error) {
    console.error("Erreur de mise à jour de l'employé:", error);
    throw new Error('L\'employé n\'a pas pu être mis à jour.');
  }
}