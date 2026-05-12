from ortools.sat.python import cp_model
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
