from .relief import rank_relief_candidates
import uuid
import json

def run_relief_trial():
    # 1. Setup Mock Data
    dept_sci = uuid.uuid4()
    dept_arts = uuid.uuid4()
    
    absent_teacher_id = uuid.uuid4()
    
    all_teachers = [
        {
            "id": uuid.uuid4(),
            "name": "Prof. X (Science)",
            "department_id": dept_sci,
            "blocked_slots": {"0": [1]}, # Blocked Monday Period 1
            "weekly_relief_cap": 3,
            "is_active": True
        },
        {
            "id": uuid.uuid4(),
            "name": "Prof. Y (Arts)",
            "department_id": dept_arts,
            "blocked_slots": {},
            "weekly_relief_cap": 3,
            "is_active": True
        },
        {
            "id": uuid.uuid4(),
            "name": "Prof. Z (Science - High Load)",
            "department_id": dept_sci,
            "blocked_slots": {},
            "weekly_relief_cap": 3,
            "is_active": True
        }
    ]
    
    # Current timetable slots (who is teaching when)
    # Let's say Prof X is NOT teaching Mon P2.
    # Prof Y is teaching Mon P2.
    current_slots = [
        {"teacher_id": all_teachers[1]["id"], "day_of_week": 0, "period": 2}
    ]
    
    # Weekly relief counts (fairness tracking)
    weekly_relief_counts = {
        all_teachers[0]["id"]: 0,
        all_teachers[1]["id"]: 0,
        all_teachers[2]["id"]: 2, # High load
    }
    
    # 2. Run Ranking for Monday Period 2
    print("--- Starting Relief Teacher Ranking Trial ---")
    print(f"Scenario: Teacher absent in Science dept on Monday P2.")
    
    candidates = rank_relief_candidates(
        absent_teacher_id=absent_teacher_id,
        absent_teacher_dept_id=dept_sci,
        day_of_week=0,
        period=2,
        all_teachers=all_teachers,
        current_slots=current_slots,
        weekly_relief_counts=weekly_relief_counts
    )
    
    print("\nRanked Candidates:")
    for c in candidates:
        print(f"  - {c['name']} (Score: {c['score']})")
        print(f"    Reasons: {c['reasons']}")

if __name__ == "__main__":
    run_relief_trial()
