/*
  Warnings:

  - A unique constraint covering the columns `[student_id,subject_id,exam_type]` on the table `marks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "marks_student_id_subject_id_key";

-- AlterTable
ALTER TABLE "marks" ADD COLUMN     "exam_type" TEXT NOT NULL DEFAULT 'Terminal';

-- CreateIndex
CREATE UNIQUE INDEX "marks_student_id_subject_id_exam_type_key" ON "marks"("student_id", "subject_id", "exam_type");
