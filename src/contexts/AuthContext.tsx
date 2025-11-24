// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { getSupabase } from '../config/supabaseClient';
const supabase = getSupabase();
import type { Session, User } from '@supabase/supabase-js';

interface EmployeeProfile {
  id_emp: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: 'admin' | 'employee';
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  employee: EmployeeProfile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const currentUser = session?.user;
      setUser(currentUser ?? null);

      if (currentUser) {
        // --- LA CORRECTION EST ICI ---
        // On dit à Supabase de chercher une ligne dans 'employees'
        // où la colonne 'id_emp' est égale à l'ID de l'utilisateur connecté.
        const { data: employeeProfile, error: profileError } = await supabase
          .from('employees')
          .select('*')
          .eq('id_emp', currentUser.id) // <-- ON UTILISE id_emp
          .single();

        if (profileError) {
          console.error("AuthContext: Erreur lors de la récupération du profil:", profileError);
        }
        
        setEmployee(employeeProfile);
      } else {
        setEmployee(null);
      }
      setIsLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        fetchSessionAndProfile();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };
  
  const value = { session, user, employee, isLoading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};