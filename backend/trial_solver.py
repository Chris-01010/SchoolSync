from .solver import TimetableSolver
import json

def run_trial():
    # 1. Mock Data Setup
    teachers = [
        {"id": 1, "name": "Alice Smith", "blocked_slots": {"Monday": [1, 2]}},
        {"id": 2, "name": "Bob Jones", "blocked_slots": {"Tuesday": [3]}}
    ]
    
    classes = [
        {
            "id": 101, 
            "name": "Grade 10A", 
            "lessons": [
                {"subject_id": 1, "teacher_id": 1, "count": 2}, # Math with Alice
                {"subject_id": 2, "teacher_id": 2, "count": 2}  # Physics with Bob
            ]
        },
        {
            "id": 102, 
            "name": "Grade 10B", 
            "lessons": [
                {"subject_id": 1, "teacher_id": 1, "count": 2}, # Math with Alice
                {"subject_id": 2, "teacher_id": 2, "count": 1}  # Physics with Bob
            ]
        }
    ]
    
    rooms = [
        {"id": 1, "name": "Room 101"},
        {"id": 2, "name": "Room 102"}
    ]
    
    subjects = [
        {"id": 1, "name": "Mathematics"},
        {"id": 2, "name": "Physics"}
    ]
    
    constraints = {} # Placeholder
    
    # 2. Initialize Solver
    # Running for 2 days, 4 periods per day for a quick trial
    solver = TimetableSolver(
        teachers=teachers,
        classes=classes,
        rooms=rooms,
        subjects=subjects,
        constraints=constraints,
        days=2,
        periods=4
    )
    
    # 3. Solve
    print("--- Starting Timetable Solver Trial ---")
    result = solver.solve()
    
    if result["status"] == "success":
        print("\nSuccess! Generated Timetable:")
        # Group by Class for better readability
        timetable = result["data"]
        for cls in classes:
            print(f"\nClass: {cls['name']}")
            cls_lessons = [l for l in timetable if l['class_id'] == cls['id']]
            # Sort by Day and Period
            cls_lessons.sort(key=lambda x: (x['day'], x['period']))
            
            for l in cls_lessons:
                day_name = ["Monday", "Tuesday"][l['day']]
                teacher_name = next(t['name'] for t in teachers if t['id'] == l['teacher_id'])
                subject_name = next(s['name'] for s in subjects if s['id'] == l['subject_id'])
                room_name = next(r['name'] for r in rooms if r['id'] == l['room_id'])
                print(f"  {day_name} P{l['period']}: {subject_name} ({teacher_name}) in {room_name}")
    else:
        print(f"\nFailed: {result.get('error', 'Unknown error')}")

if __name__ == "__main__":
    run_trial()
