import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@students_list';

export interface Student {
  id: string;
  fullName: string;
  studentCode: string;
  email: string;
  avatar?: string;
  createdAt?: number;
  updatedAt?: number;
}

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const getStudents = async (): Promise<Student[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('getStudents error', e);
    return [];
  }
};

const saveAll = async (students: Student[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

export const addStudent = async (
  student: Omit<Student, 'id'>
): Promise<Student> => {
  const students = await getStudents();
  const newStudent: Student = {
    ...student,
    id: generateId(),
    createdAt: Date.now(),
  };
  students.push(newStudent);
  await saveAll(students);
  return newStudent;
};

export const updateStudent = async (
  id: string,
  updated: Partial<Student>
): Promise<Student | null> => {
  const students = await getStudents();
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  students[idx] = { ...students[idx], ...updated, updatedAt: Date.now() };
  await saveAll(students);
  return students[idx];
};

export const deleteStudent = async (id: string): Promise<boolean> => {
  const students = await getStudents();
  const filtered = students.filter((s) => s.id !== id);
  await saveAll(filtered);
  return true;
};

export const isDuplicateStudentCode = async (
  code: string,
  excludeId?: string | null
): Promise<boolean> => {
  const students = await getStudents();
  return students.some(
    (s) =>
      s.studentCode.trim().toLowerCase() === code.trim().toLowerCase() &&
      s.id !== excludeId
  );
};