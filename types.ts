
export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'Theory' | 'Practical';
  subject: string;
}

export interface Faculty {
  id: string;
  name: string;
  expertise: string[];
  unavailableSlots?: string; // e.g., "Monday_10:00-11:00, Tuesday_14:00-15:00"
}

export interface Room {
  id: string;
  name: string;
  type: 'Lecture Hall' | 'Lab';
  capacity: number;
}

export interface Program {
  id: string;
  name: string;
  courses: string[]; // Array of course codes
}

export interface TimetableEntry {
  day: string;
  timeSlot: string;
  courseCode: string;
  facultyName: string;
  roomName: string;
  program: string;
}

export type GeneratedTimetable = TimetableEntry[];
