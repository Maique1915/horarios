import { cursos, disciplinas } from './mock-data';
import type { Curso, Disciplina } from '@/types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getCourses(): Promise<Curso[]> {
  await delay(100);
  return cursos;
}

export async function getCourse(courseId: string): Promise<Curso | undefined> {
  await delay(100);
  return cursos.find(c => c._cu === courseId);
}

export async function getDisciplines(courseId: string): Promise<Disciplina[]> {
  await delay(100);
  return disciplinas.filter(d => d._cu === courseId);
}

export async function getAllDisciplines(): Promise<Disciplina[]> {
  await delay(100);
  return disciplinas;
}
