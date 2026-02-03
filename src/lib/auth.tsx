import { createContext, useContext } from 'react';

export type UserRole = 'admin' | 'teacher' | 'student' | null;

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  studentCode?: string;
  employeeId?: string;
  department?: string;
  rollNo?: number;
  currentSemester?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, password: string, selectedRole: 'student' | 'teacher') => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

