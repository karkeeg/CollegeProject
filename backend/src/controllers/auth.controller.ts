import { Request, Response } from 'express';
import prisma from '../config/database';
import { comparePassword, generateToken } from '../services/auth.service';
import { AuthRequest, LoginRequest } from '../types';

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password, selectedRole } = req.body;

    // Validate input
    if (!email || !password || !selectedRole) {
      return res.status(400).json({ error: 'Email, password, and role selection are required' });
    }

    // 1. Find profile by email
    const profile = await prisma.profile.findUnique({
      where: { email },
    });

    if (!profile) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Verify password
    const isValidPassword = await comparePassword(password, profile.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Check selected role and fetch role-specific data
    let userData: any = null;
    let userRole: 'ADMIN' | 'TEACHER' | 'STUDENT' | null = null;

    if (selectedRole === 'student') {
      const student = await prisma.student.findUnique({
        where: { id: profile.id },
        include: {
          profile: true,
          semester: true,
        },
      });

      if (student) {
        userData = {
          id: student.id,
          email: profile.email,
          fullName: profile.fullName,
          role: 'STUDENT',
          studentCode: student.studentCode,
          rollNo: student.rollNo,
          currentSemester: student.semester?.name,
        };
        userRole = 'STUDENT';
      }
    } else if (selectedRole === 'teacher') {
      const teacher = await prisma.teacher.findUnique({
        where: { id: profile.id },
        include: {
          profile: true,
        },
      });

      if (teacher) {
        userData = {
          id: teacher.id,
          email: profile.email,
          fullName: profile.fullName,
          role: 'TEACHER',
          employeeId: teacher.employeeId,
          department: teacher.department,
        };
        userRole = 'TEACHER';
      }
    }

    // 4. Fallback to admin if not found in selected role
    if (!userData && profile.role === 'ADMIN') {
      userData = {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: 'ADMIN',
      };
      userRole = 'ADMIN';
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found in selected role' });
    }

    // 5. Generate JWT token
    const token = generateToken({
      id: userData.id,
      email: userData.email,
      role: userRole!,
    });

    return res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    let userData: any = { ...profile };

    // Fetch role-specific data
    if (profile.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { id: profile.id },
        include: { semester: true },
      });
      if (student) {
        userData = {
          ...userData,
          studentCode: student.studentCode,
          rollNo: student.rollNo,
          currentSemester: student.semester?.name,
        };
      }
    } else if (profile.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { id: profile.id },
      });
      if (teacher) {
        userData = {
          ...userData,
          employeeId: teacher.employeeId,
          department: teacher.department,
        };
      }
    }

    return res.json({ user: userData });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  // With JWT, logout is handled client-side by removing the token
  return res.json({ message: 'Logged out successfully' });
};
