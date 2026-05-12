from ortools.sat.python import cp_model
<<<<<<< HEAD
import collections

class TimetableSolver:
    def __init__(self, teachers, classes, rooms, subjects, constraints, days=5, periods=8):
        self.teachers = teachers  # {id, name, blocked_slots}
        self.classes = classes    # {id, name, lessons: [{subject_id, teacher_id, count}]}
        self.rooms = rooms        # {id, name}
        self.subjects = subjects  # {id, name}
        self.days_list = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][:days]
        self.days = range(days)
        self.periods = range(1, periods + 1)
        self.model = cp_model.CpModel()
        
    def solve(self):
        # Flatten lessons
        all_lessons = []
        for cls in self.classes:
            for lesson in cls.get('lessons', []):
                for i in range(lesson['count']):
                    all_lessons.append({
                        'class_id': cls['id'],
                        'subject_id': lesson['subject_id'],
                        'teacher_id': lesson['teacher_id'],
                        'lesson_index': i
                    })
        
        # Variables: assign[lesson_idx, day, period]
        assignments = {}
        for l_idx, lesson in enumerate(all_lessons):
            for d in self.days:
                for p in self.periods:
                    assignments[(l_idx, d, p)] = self.model.NewBoolVar(f'L{l_idx}_d{d}_p{p}')
        
        # Room variables: room_assign[lesson_idx, day, period, room_idx]
        # To simplify, let's assume each class has a fixed room or we assign rooms separately.
        # The PRD says "no room double-booking". So we need room variables.
        room_assignments = {}
        for l_idx, lesson in enumerate(all_lessons):
            for d in self.days:
                for p in self.periods:
                    for r_idx, room in enumerate(self.rooms):
                        room_assignments[(l_idx, d, p, r_idx)] = self.model.NewBoolVar(f'L{l_idx}_d{d}_p{p}_r{r_idx}')

        # Constraint 1: Each lesson instance is scheduled exactly once
        for l_idx in range(len(all_lessons)):
            self.model.Add(sum(assignments[(l_idx, d, p)] for d in self.days for p in self.periods) == 1)
            
        # Constraint 2: At most one lesson per class per (day, period)
        for cls in self.classes:
            for d in self.days:
                for p in self.periods:
                    self.model.Add(
                        sum(assignments[(l_idx, d, p)] 
                            for l_idx, lesson in enumerate(all_lessons) 
                            if lesson['class_id'] == cls['id']) <= 1
                    )
        
        # Constraint 3: At most one lesson per teacher per (day, period)
        for teacher in self.teachers:
            blocked = teacher.get('blocked_slots', {})
            
            for d in self.days:
                day_name = self.days_list[d]
                teacher_blocked_periods = blocked.get(day_name, [])
                
                for p in self.periods:
                    teacher_lessons = [l_idx for l_idx, lesson in enumerate(all_lessons) if str(lesson['teacher_id']) == str(teacher['id'])]
                    if p in teacher_blocked_periods:
                        self.model.Add(sum(assignments[(l_idx, d, p)] for l_idx in teacher_lessons) == 0)
                    else:
                        self.model.Add(sum(assignments[(l_idx, d, p)] for l_idx in teacher_lessons) <= 1)

        # Constraint 4: Room assignment logic
        # If a lesson is scheduled, exactly one room is assigned
        for l_idx in range(len(all_lessons)):
            for d in self.days:
                for p in self.periods:
                    self.model.Add(
                        sum(room_assignments[(l_idx, d, p, r_idx)] for r_idx in range(len(self.rooms))) == assignments[(l_idx, d, p)]
                    )
                    
        # Constraint 5: At most one lesson per room per (day, period)
        for r_idx in range(len(self.rooms)):
            for d in self.days:
                for p in self.periods:
                    self.model.Add(
                        sum(room_assignments[(l_idx, d, p, r_idx)] for l_idx in range(len(all_lessons))) <= 1
                    )

        # Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 60.0
        status = solver.Solve(self.model)
        
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            results = []
            for l_idx, lesson in enumerate(all_lessons):
                for d in self.days:
                    for p in self.periods:
                        if solver.Value(assignments[(l_idx, d, p)]):
                            # Find assigned room
                            assigned_room_id = None
                            for r_idx, room in enumerate(self.rooms):
                                if solver.Value(room_assignments[(l_idx, d, p, r_idx)]):
                                    assigned_room_id = room['id']
                                    break
                            
                            results.append({
                                'class_id': lesson['class_id'],
                                'teacher_id': lesson['teacher_id'],
                                'subject_id': lesson['subject_id'],
                                'day': d,
                                'period': p,
                                'room_id': assigned_room_id
                            })
            return {"status": "success", "data": results}
        else:
            return {"status": "failed", "error": "No solution found"}
=======
from typing import List, Dict, Any, Optional

class TimetableSolver:
    def __init__(self, teachers: List[Dict], classes: List[Dict], rooms: List[Dict], subjects: List[Dict], constraints: Dict, days: int = 5, periods: int = 8):
        self.teachers = teachers
        self.classes = classes
        self.rooms = rooms
        self.subjects = subjects
        self.constraints = constraints
        self.days = days
        self.periods = periods
        self.model = cp_model.CpModel()
        self.vars = {}

    def solve(self) -> Dict[str, Any]:
        """
        Generates a timetable based on inputs.
        Each variable is (class, teacher, subject, room, day, period)
        """
        num_days = self.days
        num_periods = self.periods
        
        # 1. Create Variables
        # For each class and their required lessons, we need to assign a slot (day, period, room)
        # However, to keep it simple, we define boolean variables for:
        # (class, teacher, subject, room, day, period)
        
        # Mapping for better performance
        teacher_ids = [t['id'] for t in self.teachers]
        room_ids = [r['id'] for r in self.rooms]
        class_ids = [c['id'] for c in self.classes]
        
        # assignment[class_id, teacher_id, subject_id, room_id, day, period]
        assignments = {}
        for c in self.classes:
            for lesson in c['lessons']:
                t_id = lesson['teacher_id']
                s_id = lesson['subject_id']
                for r_id in room_ids:
                    for d in range(num_days):
                        for p in range(1, num_periods + 1):
                            assignments[(c['id'], t_id, s_id, r_id, d, p)] = self.model.NewBoolVar(
                                f'c{c["id"]}_t{t_id}_s{s_id}_r{r_id}_d{d}_p{p}'
                            )

        # 2. Constraints
        
        # C1: Each required lesson for a class must be scheduled exactly 'count' times
        for c in self.classes:
            for lesson in c['lessons']:
                t_id = lesson['teacher_id']
                s_id = lesson['subject_id']
                count = lesson['count']
                
                relevant_vars = [
                    assignments[(c['id'], t_id, s_id, r_id, d, p)]
                    for r_id in room_ids for d in range(num_days) for p in range(1, num_periods + 1)
                ]
                self.model.Add(sum(relevant_vars) == count)

        # C2: A teacher can only be in one place at a time (one class/room)
        for t_id in teacher_ids:
            for d in range(num_days):
                for p in range(1, num_periods + 1):
                    teacher_vars = [
                        assignments[(c_id, t_id, s_id, r_id, d, p)]
                        for (c_id, tc_id, s_id, r_id, day, period), var in assignments.items()
                        if tc_id == t_id and day == d and period == p
                    ]
                    self.model.Add(sum(teacher_vars) <= 1)

        # C3: A room can only hold one class at a time
        for r_id in room_ids:
            for d in range(num_days):
                for p in range(1, num_periods + 1):
                    room_vars = [
                        assignments[(c_id, t_id, s_id, r_id, d, p)]
                        for (c_id, t_id, s_id, rm_id, day, period), var in assignments.items()
                        if rm_id == r_id and day == d and period == p
                    ]
                    self.model.Add(sum(room_vars) <= 1)

        # C4: A class can only have one lesson at a time
        for c_id in class_ids:
            for d in range(num_days):
                for p in range(1, num_periods + 1):
                    class_vars = [
                        assignments[(c_id, t_id, s_id, r_id, d, p)]
                        for (cl_id, t_id, s_id, r_id, day, period), var in assignments.items()
                        if cl_id == c_id and day == d and period == p
                    ]
                    self.model.Add(sum(class_vars) <= 1)

        # C5: Teacher blocked slots
        # Map day index to names if necessary, here we assume 0=Mon
        day_map = {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday"}
        for t in self.teachers:
            blocked = t.get('blocked_slots', {})
            for d_idx, d_name in day_map.items():
                if d_idx >= num_days: continue
                # Handle both string day names and string indices
                periods_to_block = blocked.get(d_name, []) or blocked.get(str(d_idx), [])
                for p in periods_to_block:
                    if p > num_periods: continue
                    # For this teacher, day, and period, sum of all assignments must be 0
                    teacher_blocked_vars = [
                        var for (c_id, tc_id, s_id, r_id, day, period), var in assignments.items()
                        if tc_id == t['id'] and day == d_idx and period == p
                    ]
                    for v in teacher_blocked_vars:
                        self.model.Add(v == 0)

        # 3. Solve
        solver = cp_model.CpSolver()
        status = solver.Solve(self.model)

        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            timetable = []
            for (c_id, t_id, s_id, r_id, d, p), var in assignments.items():
                if solver.Value(var):
                    timetable.append({
                        "class_id": c_id,
                        "teacher_id": t_id,
                        "subject_id": s_id,
                        "room_id": r_id,
                        "day": d,
                        "period": p
                    })
            return {"status": "success", "data": timetable}
        else:
            return {"status": "failed", "error": "No feasible solution found"}
>>>>>>> e3f1e661e693b176bb45382c83f511b9e415f857
