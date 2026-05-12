from ortools.sat.python import cp_model
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
