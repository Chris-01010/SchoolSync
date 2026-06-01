# ─────────────────────────────────────────────────────────────────────────────
# ADD THIS BLOCK to admin_dashboard.py
# Place it immediately after the get_hod_stats() function (around line 90).
#
# This endpoint is called by HODDashboard.jsx at:
#   GET /api/v1/admin/hod/teachers
#
# It returns all active teachers in the HOD's own department.
# The data drives the Staff card and Workload card on the HOD dashboard.
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/hod/teachers")
async def get_hod_department_teachers(
    current_user: User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns all active teachers in the HOD's department.
    Accessible by HOD (scoped to their dept) and ADMIN (must supply dept via query param — not needed for HOD dashboard).
    """
    if current_user.role not in (UserRole.HOD, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="HOD or Admin access required.")

    # Resolve the department this HOD belongs to
    hod_result = await db.execute(
        select(Teacher).where(Teacher.user_id == current_user.id)
    )
    hod = hod_result.scalar_one_or_none()

    if not hod or not hod.department_id:
        raise HTTPException(
            status_code=404,
            detail=(
                "No Teacher profile linked to this user, or HOD has no department assigned. "
                "Ensure the HOD account has a Teacher row with a department_id."
            ),
        )

    dept_id = hod.department_id

    teachers_result = await db.execute(
        select(Teacher).where(
            Teacher.department_id == dept_id,
            Teacher.is_active == True,
        ).order_by(Teacher.name)
    )
    teachers = teachers_result.scalars().all()

    return [
        {
            "id":                   str(t.id),
            "name":                 t.name,
            "email":                t.email,
            "current_relief_hours": t.current_relief_hours or 0,
            "weekly_relief_cap":    t.weekly_relief_cap or 3,
            "total_hours_worked":   t.total_hours_worked or 0,
            "max_weekly_hours":     t.max_weekly_hours or 30,
        }
        for t in teachers
    ]
