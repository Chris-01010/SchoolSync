// Teacher Dashboard mock data (frontend-only prototype)

export const teacher = {
  name: 'Meera Nair',
  department: 'Science',
  teachingHours: { completed: 18, total: 22 },
  reliefHours: { completed: 3, total: 5 },
  // PRD: remainingCap = 22 - 18 - 3
  remainingCap: 4
};

// Timetable: day -> period -> cell
// PRD format: day (string) -> period (number) -> { type, subject, class, room, originalTeacher? }
export const timetable = {
  Monday: {
    1: { type: 'regular', subject: 'Physics', class: '10A', room: '304' },
    2: { type: 'regular', subject: 'Chemistry', class: '9B', room: 'Lab 2' },
    3: { type: 'free' },
    4: { type: 'regular', subject: 'Physics', class: '10C', room: '305' },
    5: { type: 'free' },
    6: { type: 'relief', subject: 'Biology', class: '8A', room: '210', originalTeacher: 'J. Smith' },
    7: { type: 'regular', subject: 'Chemistry', class: '11A', room: 'Lab 1' },
    8: { type: 'free' }
  },
  Tuesday: {
    1: { type: 'regular', subject: 'Physics', class: '12A', room: '301' },
    2: { type: 'regular', subject: 'Chemistry', class: '11C', room: 'Lab 2' },
    3: { type: 'relief', subject: 'History', class: '7C', room: '205', originalTeacher: 'J. Smith' },
    4: { type: 'free' },
    5: { type: 'regular', subject: 'Biology', class: '9A', room: '206' },
    6: { type: 'free' },
    7: { type: 'regular', subject: 'Chemistry', class: '10B', room: 'Lab 3' },
    8: { type: 'free' }
  },
  Wednesday: {
    1: { type: 'free' },
    2: { type: 'regular', subject: 'Physics', class: '9C', room: '307' },
    3: { type: 'free' },
    4: { type: 'relief', subject: 'Math', class: '10A', room: '201', originalTeacher: 'Arjun Das' },
    5: { type: 'regular', subject: 'Chemistry', class: '11B', room: 'Lab 2' },
    6: { type: 'free' },
    7: { type: 'regular', subject: 'Biology', class: '8B', room: '214' },
    8: { type: 'free' }
  },
  Thursday: {
    1: { type: 'regular', subject: 'Physics', class: '10D', room: '304' },
    2: { type: 'free' },
    3: { type: 'regular', subject: 'Chemistry', class: '9B', room: 'Lab 1' },
    4: { type: 'free' },
    5: { type: 'regular', subject: 'Biology', class: '11A', room: '206' },
    6: { type: 'free' },
    7: { type: 'relief', subject: 'Computer', class: '8A', room: '112', originalTeacher: 'S. Gupta' },
    8: { type: 'free' }
  },
  Friday: {
    1: { type: 'regular', subject: 'Chemistry', class: '10A', room: 'Lab 2' },
    2: { type: 'free' },
    3: { type: 'regular', subject: 'Physics', class: '11C', room: '305' },
    4: { type: 'free' },
    5: { type: 'regular', subject: 'Biology', class: '9A', room: '206' },
    6: { type: 'free' },
    7: { type: 'regular', subject: 'Chemistry', class: '12A', room: 'Lab 1' },
    8: { type: 'free' }
  }
};

export const flagReasons = [
  'Overwork',
  'Emergency Duty',
  'Schedule Conflict',
  'Incorrect Allocation'
];

export const pendingRequests = [
  {
    id: 'p1',
    absentTeacher: 'Ravi Kumar',
    subject: 'Physics',
    class: '9B',
    period: 3,
    day: 'Monday',
    deadline: '45 mins',
    urgency: 'high'
  },
  {
    id: 'p2',
    absentTeacher: 'Arjun Das',
    subject: 'Math',
    class: '10A',
    period: 5,
    day: 'Wednesday',
    deadline: '2 hrs',
    urgency: 'medium'
  }
];

export const confirmedReliefs = [
  {
    id: 'c1',
    subject: 'Chemistry',
    class: '11C',
    day: 'Tuesday',
    period: 2,
    originalTeacher: 'Arjun Das'
  }
];

