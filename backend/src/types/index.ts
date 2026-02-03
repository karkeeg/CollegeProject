import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  selectedRole: 'student' | 'teacher';
}

export interface TokenPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}
