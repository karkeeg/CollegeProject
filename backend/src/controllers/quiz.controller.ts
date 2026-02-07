import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import { QuizGeneratorAlgorithm, Question } from '../algorithms/quiz.algorithm';

// --- Teacher Endpoints ---

// Get all quizzes for a subject
export async function getQuizzesBySubject(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { subjectId } = req.params;
        const quizzes = await prisma.quiz.findMany({
            where: { subjectId: parseInt(subjectId as string) },
            orderBy: { createdAt: 'desc' }
        });
        res.json(quizzes);
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
}

// Generate a draft quiz (does not save to DB)
export async function generateQuizDraft(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { subjectId } = req.body;
        const teacherId = req.user!.id;

        const questions = await QuizGeneratorAlgorithm.generateQuizDraft(parseInt(subjectId), teacherId);
        res.json({ questions });
    } catch (error) {
        console.error('Error generating quiz draft:', error);
        res.status(500).json({ error: 'Failed to generate quiz draft' });
    }
}

// Save or Update a quiz
export async function saveQuiz(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { id, subjectId, title, description, questions } = req.body;
        const teacherId = req.user!.id;

        if (id) {
            // Update existing quiz
            const quiz = await prisma.quiz.update({
                where: { id: parseInt(id) },
                data: {
                    title,
                    description,
                    questions: questions as any,
                }
            });
            res.json(quiz);
        } else {
            // Create new quiz
            const quiz = await prisma.quiz.create({
                data: {
                    subjectId: parseInt(subjectId),
                    teacherId,
                    title,
                    description,
                    questions: questions as any
                }
            });
            res.json(quiz);
        }
    } catch (error) {
        console.error('Error saving quiz:', error);
        res.status(500).json({ error: 'Failed to save quiz' });
    }
}

// Get a full quiz (for editing)
export async function getQuizForTeacher(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const quiz = await prisma.quiz.findUnique({
            where: { id: parseInt(id as string) }
        });
        
        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
}

// --- Student Endpoints ---

// Get Quiz for Taking (Hide correct answers unless already attempted!)
export async function getQuizForStudent(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const studentId = req.user!.id;

        const quiz = await prisma.quiz.findUnique({
            where: { id: parseInt(id as string) }
        });

        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }

        // Check if student already has an attempt
        const attempt = await prisma.quizAttempt.findFirst({
            where: { quizId: quiz.id, studentId }
        });

        if (attempt) {
            // Already taken - include correct answers for review
            res.json({
                ...quiz,
                attempt,
                isCompleted: true
            });
        } else {
            // Not taken - hide correct answers
            const sanitizedQuestions = (quiz.questions as unknown as Question[]).map(q => {
                const { correctAnswer, ...rest } = q;
                return rest;
            });

            res.json({
                ...quiz,
                questions: sanitizedQuestions,
                isCompleted: false
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to load quiz' });
    }
}

// Submit Quiz Attempt
export async function submitQuizAttempt(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { quizId, answers } = req.body; // answers: { "0": "True", "1": "Component A" }
        const studentId = req.user!.id;

        // 1. Fetch Quiz with correct answers
        const quiz = await prisma.quiz.findUnique({
            where: { id: parseInt(quizId) }
        });

        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }

        const questions = quiz.questions as unknown as Question[];
        
        // 2. Calculate Score
        let correctCount = 0;
        let totalQuestions = questions.length;

        questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                correctCount++;
            }
        });

        const score = (correctCount / totalQuestions) * 100;

        // 3. Save Attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                quizId: parseInt(quizId),
                studentId,
                answers: answers,
                score
            }
        });

        res.json({ attempt, correctCount, totalQuestions });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
}

// Get Student Results for a specific quiz
export async function getStudentQuizResult(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params; // quizId
        const studentId = req.user!.id;

        // Find the latest attempt
        const attempt = await prisma.quizAttempt.findFirst({
            where: {
                quizId: parseInt(id as string),
                studentId
            },
            orderBy: { completedAt: 'desc' }
        });

        res.json({ attempt });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch results' });
    }
}

// Delete a quiz
export async function deleteQuiz(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        await prisma.quiz.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
}
