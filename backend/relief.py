



import random
from typing import List, Dict, Optional
from uuid import UUID

def rank_relief_candidates(
    absent_teacher_id: UUID,
    absent_teacher_dept_id: Optional[UUID],
    day_of_week: int,
    period: int,
    all_teachers: List[Dict],
    current_slots: List[Dict],
    weekly_relief_counts: Dict[UUID, int]
) -> List[Dict]:
    """
    Ranks potential relief teachers based on the algorithm in the PRD.
    
    Pool = active, not teaching this period, not blocked, not self, not at cap.
    """
    
    # Identify who is teaching this period
    teaching_now = {slot['teacher_id'] for slot in current_slots if slot['day_of_week'] == day_of_week and slot['period'] == period}
    
    pool = []
    for t in all_teachers:
        t_id = t['id']
        
        # 1. Pool filters
        if not t.get('is_active', True): continue
        if t_id == absent_teacher_id: continue
        if t_id in teaching_now: continue
        
        # Blocked slots check - day_of_week is 0-6 (0=Mon), but blocked_slots might use string keys
        day_names = ["0", "1", "2", "3", "4", "5", "6"] # Use string indices for JSON compatibility
        day_key = day_names[day_of_week]
        if period in t.get('blocked_slots', {}).get(day_key, []): continue
        
        # Weekly cap check
        load = weekly_relief_counts.get(t_id, 0)
        if load >= t.get('weekly_relief_cap', 3): continue
        
        pool.append(t)
    
    if not pool:
        return []

    lowest_load = min(weekly_relief_counts.get(t['id'], 0) for t in pool)

    scored = []
    for t in pool:
        t_id = t['id']
        score = 0
        reasons = []
        
        # +20 if same department
        if absent_teacher_dept_id and t.get('department_id') == absent_teacher_dept_id:
            score += 20
            reasons.append("Same department")
            
        # Fairness bonus (max 10)
        load = weekly_relief_counts.get(t_id, 0)
        load_diff = lowest_load - load
        fairness_bonus = min(load_diff * 5, 10)
        if fairness_bonus < 0: fairness_bonus = 0
        
        score += fairness_bonus
        reasons.append(f"Relief count: {load}")

        scored.append({
            'teacher_id': t_id,
            'name': t['name'],
            'score': score,
            'reasons': "; ".join(reasons)
        })

    # Sort by score desc, tie-break random
    scored.sort(key=lambda x: (x['score'], random.random()), reverse=True)
    return scored
