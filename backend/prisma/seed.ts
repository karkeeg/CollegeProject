import prisma from '../src/config/database';
import { hashPassword } from '../src/services/auth.service';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create semesters
  const semesters = await Promise.all([
    prisma.semester.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, name: '1st Semester', batchYear: 2023 },
    }),
    prisma.semester.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, name: '2nd Semester', batchYear: 2023 },
    }),
    prisma.semester.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, name: '3rd Semester', batchYear: 2022 },
    }),
    prisma.semester.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, name: '4th Semester', batchYear: 2022 },
    }),
    prisma.semester.upsert({
      where: { id: 5 },
      update: {},
      create: { id: 5, name: '5th Semester', batchYear: 2021 },
    }),
    prisma.semester.upsert({
      where: { id: 6 },
      update: {},
      create: { id: 6, name: '6th Semester', batchYear: 2021 },
    }),
  ]);

  console.log('✅ Created semesters');

  // Create subjects for 6th semester
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        code: 'CACS351',
        name: 'Artificial Intelligence',
        creditHours: 3,
        fullMarks: 100,
        passMarks: 40,
        semesterId: 6,
      },
    }),
    prisma.subject.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        code: 'CACS352',
        name: 'Cyber Law and Professional Ethics',
        creditHours: 3,
        fullMarks: 100,
        passMarks: 40,
        semesterId: 6,
      },
    }),
    prisma.subject.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        code: 'CACS353',
        name: 'Cloud Computing',
        creditHours: 3,
        fullMarks: 100,
        passMarks: 40,
        semesterId: 6,
      },
    }),
    prisma.subject.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        code: 'CACS354',
        name: 'Internship',
        creditHours: 3,
        fullMarks: 100,
        passMarks: 40,
        semesterId: 6,
      },
    }),
  ]);

  console.log('✅ Created subjects');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.profile.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      fullName: 'System Administrator',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user');

  // Create a teacher
  const teacherPassword = await hashPassword('teacher123');
  const teacher = await prisma.profile.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      password: teacherPassword,
      fullName: 'John Doe',
      role: 'TEACHER',
      teacher: {
        create: {
          employeeId: 'T001',
          department: 'Computer Science',
          qualification: 'PhD in Computer Science',
        },
      },
    },
  });

  console.log('✅ Created teacher');

  // Create a student
  const studentPassword = await hashPassword('student123');
  const student = await prisma.profile.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      password: studentPassword,
      fullName: 'Jane Smith',
      role: 'STUDENT',
      student: {
        create: {
          studentCode: 'TUCHE-2021-01',
          rollNo: 1,
          regNo: 'REG001',
          currentSemesterId: 6,
          phone: '9841234567',
          address: 'Kathmandu, Nepal',
        },
      },
    },
  });

  console.log('✅ Created student');

  // Create Course Assignments
  await prisma.courseAssignment.createMany({
    data: [
      {
        subjectId: 1, // Artificial Intelligence
        teacherId: teacher.id,
        title: 'Neural Networks Implementation',
        description: 'Implement a simple backpropagation neural network from scratch.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxMarks: 20,
      },
      {
        subjectId: 3, // Cloud Computing
        teacherId: teacher.id,
        title: 'AWS Infrastructure Setup',
        description: 'Set up a VPC with public and private subnets using Terraform.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        maxMarks: 15,
      },
    ],
  });

  console.log('✅ Created course assignments');

  // Create Exam Schedule
  await prisma.examSchedule.createMany({
    data: [
      {
        semesterId: 6,
        subjectId: 1,
        examType: 'MID_TERM',
        date: new Date('2024-04-15'),
        startTime: '10:00 AM',
        endTime: '1:00 PM',
        room: '401',
      },
      {
        semesterId: 6,
        subjectId: 2,
        examType: 'MID_TERM',
        date: new Date('2024-04-16'),
        startTime: '10:00 AM',
        endTime: '1:00 PM',
        room: '402',
      },
    ],
  });

  console.log('✅ Created exam schedules');

  // Create Internship/Project for the student
  await prisma.internshipProject.create({
    data: {
      studentId: student.id,
      type: 'PROJECT',
      title: 'AI Based Attendance System',
      description: 'Face recognition based attendance system using Python and OpenCV.',
      supervisor: 'John Doe',
      status: 'IN_PROGRESS',
      startDate: new Date('2024-01-01'),
    },
  });

  console.log('✅ Created internship/project data');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Teacher: teacher@example.com / teacher123');
  console.log('Student: student@example.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
