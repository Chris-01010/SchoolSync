// ─── Teacher identity ─────────────────────────────────────────────────────────
export const teacher = {
  name: 'Dr. Sarah Johnson',
  department: 'Mathematics',
  employeeId: 'TCH-101',
  email: 'sarah.johnson@institution.edu',
  phone: '+91 98765 43210',
  joined: 'August 2022',
  avatar: null,
  teachingHours: { completed: 22, total: 30 },
  reliefHours: { completed: 4, total: 8 },
  remainingCap: 4,
};

// ─── Summary card stats ───────────────────────────────────────────────────────
export const teacherStats = {
  totalClassesToday: 5,
  completedClassesToday: 2,
  freePeriodsToday: 3,
  pendingLeaveRequests: 1,
  approvedLeaves: 2,
  reliefDutiesToday: 1,
  totalTeachingHoursWeek: 22,
  totalReliefHoursWeek: 3,
};

// ─── Today's schedule preview ─────────────────────────────────────────────────
export const todaySchedule = [
  {
    id: 'ts1',
    period: 3,
    timeStart: '09:45',
    timeEnd: '10:45',
    subject: '10A Mathematics',
    room: 'Rm 101',
    students: 32,
    type: 'current', // current | upcoming | later | free
    label: '• Now • Period 3',
  },
  {
    id: 'ts2',
    period: 4,
    timeStart: '11:00',
    timeEnd: '12:00',
    subject: '10B Mathematics',
    room: 'Rm 102',
    students: 30,
    type: 'upcoming',
    label: 'Next • Period 4',
  },
  {
    id: 'ts3',
    period: 5,
    timeStart: '12:00',
    timeEnd: '13:00',
    subject: 'Free Period',
    room: null,
    students: null,
    type: 'free',
    label: 'Later • Period 5',
    note: 'Opportunity for departmental planning',
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = [
  {
    id: 'n1',
    type: 'leave_approved',
    title: 'Personal Leave Approved',
    message: 'Your leave for Oct 30 has been granted by the HOD.',
    time: '2h ago',
    read: false,
    icon: 'check',
  },
  {
    id: 'n2',
    type: 'relief_assigned',
    title: 'New Relief Duty Assigned',
    message: 'Assigned for Mr. Wilson (Period 6) in Lab 2.',
    time: '4h ago',
    read: false,
    icon: 'relief',
  },
  {
    id: 'n3',
    type: 'announcement',
    title: 'Departmental Meeting',
    message: 'Final reminder: Math Dept meeting at 3:30 PM today.',
    time: '5h ago',
    read: true,
    icon: 'info',
  },
];

// ─── Active relief duties today ───────────────────────────────────────────────
export const activeReliefDutiesToday = [
  {
    id: 'ar1',
    forTeacher: 'Dr. Patel',
    period: 2,
    subject: 'Grade 11 Physics',
    room: 'Physics Lab A',
    department: 'Mathematics Dept',
    avatar: null,
    upcoming: false,
    lessonPlanUrl: '/mock/lesson-plan.pdf',
  },
  {
    id: 'ar2',
    forTeacher: 'Ms. Williams',
    period: 7,
    subject: 'Grade 9 General Math',
    room: 'Rm 304',
    department: null,
    avatar: null,
    upcoming: true,
    lessonPlanUrl: null,
  },
];

// ─── Weekly timetable grid ────────────────────────────────────────────────────
export const timetable = {
  Monday: {
    1: { type: 'regular', subject: 'Math 101', class: '10A', room: 'Room 402' },
    2: { type: 'relief', subject: 'Relief: Dr. P', class: 'Class 9B', room: 'Room 205', originalTeacher: 'Dr. Patel' },
    3: { type: 'free' },
    4: { type: 'regular', subject: 'Applied Physics', class: '11A', room: 'Lab 3' },
    5: { type: 'free' },
  },
  Tuesday: {
    1: { type: 'free' },
    2: { type: 'current', subject: 'Advanced Stats', class: '12A', room: 'Room 202', students: 24, isNow: true },
    3: { type: 'free' },
    4: { type: 'free' },
    5: { type: 'free' },
  },
  Wednesday: {
    1: { type: 'regular', subject: 'Calculus', class: '11B', room: 'Room 101' },
    2: { type: 'free' },
    3: { type: 'cancelled', subject: 'Algebra-II', class: '10C', room: 'Room 103' },
    4: { type: 'free' },
    5: { type: 'free' },
  },
  Thursday: {
    1: { type: 'free' },
    2: { type: 'regular', subject: 'Staff Meeting', class: '', room: 'Room 102' },
    3: { type: 'free' },
    4: { type: 'regular', subject: 'Tutoring', class: '9A', room: 'Library' },
    5: { type: 'free' },
  },
  Friday: {
    1: { type: 'regular', subject: 'Geometry', class: '10B', room: 'Room 205' },
    2: { type: 'regular', subject: 'Quiz Session', class: '11C', room: 'Room 402' },
    3: { type: 'free' },
    4: { type: 'free' },
    5: { type: 'free' },
  },
};

// ─── Upcoming transitions ─────────────────────────────────────────────────────
export const upcomingTransitions = [
  {
    id: 'ut1',
    label: 'Next: Lab Session',
    detail: 'Starts in 15 minutes · Rm 302',
    type: 'class',
  },
  {
    id: 'ut2',
    label: 'Relief Duty Notification',
    detail: "Tomorrow 09:00 for Dr. Harrison",
    type: 'relief',
  },
];

// ─── Leave requests ───────────────────────────────────────────────────────────
export const leaveRequests = [
  {
    id: 'L-101',
    type: 'Sick Leave',
    from: '2024-01-20',
    to: '2024-01-22',
    days: 3,
    reason: 'Medical appointment and recovery.',
    status: 'pending',
    document: 'medical_cert.pdf',
    affectedClasses: [
      { date: 'Mon, Jan 20', periods: 'Period 2, 4, 7' },
      { date: 'Tuesday, Jan 21', periods: 'Period 1, 3, 5' },
    ],
  },
  {
    id: 'L-098',
    type: 'Casual Leave',
    from: '2024-01-15',
    to: '2024-01-15',
    days: 1,
    reason: 'Personal work.',
    status: 'approved',
    document: null,
    affectedClasses: [],
  },
  {
    id: 'L-095',
    type: 'Duty Leave',
    from: '2024-01-10',
    to: '2024-01-10',
    days: 1,
    reason: 'External examination duty.',
    status: 'rejected',
    document: null,
    affectedClasses: [],
  },
];

// ─── My relief duties ─────────────────────────────────────────────────────────
export const myReliefDuties = {
  upcoming: [
    {
      id: 'rd1',
      date: 'Tomorrow, 09:00 AM',
      dateLabel: 'Tomorrow',
      subject: 'Class 10A Physics',
      room: 'Room Lab 3',
      relieving: 'Dr. Patel',
      notes: 'Please cover Chapter 5 exercises',
      status: 'upcoming',
      lessonPlanUrl: '/mock/lesson-plan.pdf',
    },
  ],
  completed: [
    {
      id: 'rd2',
      date: 'Jan 10',
      subject: 'Class 10B Math',
      room: 'Room 201',
      relieving: 'Dr. Johnson',
      period: 3,
      status: 'completed',
      lessonPlanUrl: null,
    },
    {
      id: 'rd3',
      date: 'Jan 8',
      subject: 'Class 9C Science',
      room: 'Lab 1',
      relieving: 'Dr. Patel',
      period: 1,
      status: 'completed',
      lessonPlanUrl: '/mock/lesson-plan.pdf',
    },
  ],
};

// ─── Workload statistics ──────────────────────────────────────────────────────
export const workloadStats = {
  teachingHours: { current: 22, total: 30 },
  weeklyBreakdown: { teaching: 18, relief: 4, free: 8 },
  deptBenchmarkDelta: '+12%',
  deptBenchmarkLabel: 'Above department average load',
  deptName: 'Mathematics Dept',
  dailyHours: [
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 3 },
    { day: 'Wed', hours: 5 },
    { day: 'Thu', hours: 4 },
    { day: 'Fri', hours: 3 },
  ],
  changeFromLastWeek: -2,
};

// ─── HOD/Legacy exports (unchanged) ──────────────────────────────────────────
export const flagReasons = [
  'Overwork',
  'Emergency Duty',
  'Schedule Conflict',
  'Incorrect Allocation',
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
    urgency: 'high',
  },
  {
    id: 'p2',
    absentTeacher: 'Arjun Das',
    subject: 'Math',
    class: '10A',
    period: 5,
    day: 'Wednesday',
    deadline: '2 hrs',
    urgency: 'medium',
  },
];

export const confirmedReliefs = [
  {
    id: 'c1',
    subject: 'Chemistry',
    class: '11C',
    day: 'Tuesday',
    period: 2,
    originalTeacher: 'Arjun Das',
  },
];
