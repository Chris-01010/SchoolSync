import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, Base, AsyncSessionLocal
import models
import auth

async def seed_data():
    async with engine.begin() as conn:
        # Recreate tables for a clean start
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        from sqlalchemy import select

        # 1. Create Admin User
        admin_email = "admin@schoolsync.com"
        admin_pass = "admin123"
        
        result = await db.execute(select(models.User).filter(models.User.email == admin_email))
        if not result.scalars().first():
            admin_user = models.User(
                college_id="ADM001",
                email=admin_email,
                password_hash=auth.get_password_hash(admin_pass),
                role=models.UserRole.ADMIN,
                is_verified=True
            )
            db.add(admin_user)
            print(f"Created Admin: {admin_email} / {admin_pass}")
        
        # 2. Create a Department
        dept_name = "Science"
        result = await db.execute(select(models.Department).filter(models.Department.name == dept_name))
        dept = result.scalars().first()
        if not dept:
            dept = models.Department(name=dept_name)
            db.add(dept)
            print(f"Created Department: {dept_name}")
        
        await db.commit()
        await db.refresh(dept)

        # 3. Create a Teacher User & Profile
        teacher_email = "teacher@schoolsync.com"
        teacher_pass = "teacher123"
        
        result = await db.execute(select(models.User).filter(models.User.email == teacher_email))
        if not result.scalars().first():
            teacher_user = models.User(
                college_id="TCH001",
                email=teacher_email,
                password_hash=auth.get_password_hash(teacher_pass),
                role=models.UserRole.TEACHER,
                is_verified=True
            )
            db.add(teacher_user)
            await db.commit()
            await db.refresh(teacher_user)

            teacher_profile = models.Teacher(
                user_id=teacher_user.id,
                name="John Doe",
                email=teacher_email,
                department_id=dept.id,
                weekly_relief_cap=3,
                max_weekly_hours=30
            )
            db.add(teacher_profile)
            print(f"Created Teacher: {teacher_email} / {teacher_pass}")
        
        # 4. Create an HOD User & Profile
        hod_email = "hod@schoolsync.com"
        hod_pass = "hod123"
        
        result = await db.execute(select(models.User).filter(models.User.email == hod_email))
        if not result.scalars().first():
            hod_user = models.User(
                college_id="HOD001",
                email=hod_email,
                password_hash=auth.get_password_hash(hod_pass),
                role=models.UserRole.HOD,
                is_verified=True
            )
            db.add(slot)
            slot_count += 1

        await db.commit()
        print(f"  ✓ {slot_count} timetable slots (John Doe full week, 6 periods/day)")

        # ============================================================
        # GROUP H — Absences / Leave Applications (8)
        # Fixed weekday dates so the engine always finds timetable slots.
        # John Doe absence = last Tuesday (always a weekday John has slots).
        # ============================================================
        today = date.today()
        # Find the most recent Tuesday (weekday 1)
        days_since_tuesday = (today.weekday() - 1) % 7
        last_tuesday = today - timedelta(days=days_since_tuesday)

        absences_data = [
            ("Priya Menon",    today + timedelta(days=2),   1, 3, "Sick Leave",     "Fever and rest advised by doctor",   models.AbsenceStatus.PENDING),
            ("Ravi Iyer",      today + timedelta(days=3),   1, 6, "Casual Leave",   "Wedding in family",                  models.AbsenceStatus.PENDING),
            ("Fatima Khan",    today + timedelta(days=1),   4, 6, "Personal Leave", "Urgent personal matter",             models.AbsenceStatus.PENDING),
            ("Arjun Nair",     today + timedelta(days=5),   1, 6, "Casual Leave",   "Family function",                    models.AbsenceStatus.APPROVED),
            ("Lakshmi Rao",    today + timedelta(days=7),   1, 6, "Earned Leave",   "Annual vacation",                    models.AbsenceStatus.APPROVED),
            ("John Doe",       last_tuesday,                3, 5, "Sick Leave",     "Migraine",                           models.AbsenceStatus.APPROVED),
            ("George Mathew",  today - timedelta(days=5),   1, 3, "Sick Leave",     "Flu",                                models.AbsenceStatus.APPROVED),
            ("Sneha Varma",    today + timedelta(days=4),   1, 2, "Personal Leave", "Bank appointment",                   models.AbsenceStatus.REJECTED),
        ]
        absence_ids = {}
        for name, abs_date, p_start, p_end, leave_type, reason, status in absences_data:
            absence = models.Absence(
                teacher_id=teacher_ids[name],
                date=abs_date,
                period_start=p_start,
                period_end=p_end,
                leave_type=leave_type,
                reason=reason,
                status=status,
                resolved=(status == models.AbsenceStatus.APPROVED and abs_date < today),
            )
            db.add(hod_profile)
            await db.flush()
            absence_ids[name] = absence.id
        await db.commit()
        print(f"  ✓ {len(absences_data)} absence records")

        # ============================================================
        # GROUP I — Relief Assignments (6)
        # ============================================================
        relief_data = [
            ("Arjun Nair",   "Lakshmi Rao",  88, models.ReliefStatus.ACCEPTED, "AD/IT cross-coverage, available all day"),
            ("Lakshmi Rao",  "Fatima Khan",  85, models.ReliefStatus.PENDING,  "Same IT department, free during P4-P6"),
            ("John Doe",     "Priya Menon",  92, models.ReliefStatus.ACCEPTED, "Same CS department, OOP expertise"),
            ("George Mathew","Sneha Varma",  90, models.ReliefStatus.ACCEPTED, "EC/AEI cross-coverage, low weekly load"),
            ("Priya Menon",  "Ravi Iyer",    78, models.ReliefStatus.PENDING,  "Same CS dept, data structures expertise"),
            ("Fatima Khan",  "Lakshmi Rao",  82, models.ReliefStatus.PENDING,  "IT dept colleague, free periods P4-P6"),
        ]
        relief_count = 0
        for abs_key, relief_name, score, status, reason in relief_data:
            if abs_key not in absence_ids or relief_name not in teacher_ids:
                continue
            relief = models.ReliefAssignment(
                absence_id=absence_ids[abs_key],
                relief_teacher_id=teacher_ids[relief_name],
                slot_id=None,
                score=score,
                status=status,
                reason_text=reason,
            )
            db.add(relief)
            relief_count += 1
        await db.commit()
        print(f"  ✓ {relief_count} relief assignments")

        # ============================================================
        # GROUP J — Notifications (10)
        # ============================================================
        notifications_data = [
            ("teacher@schoolsync.com",       "Relief assignment confirmed",
             "You have been assigned to cover P3 (11:00-12:00), CS S5-A on Tuesday."),
            ("teacher@schoolsync.com",       "Leave application approved",
             "Your sick leave request for last week has been approved."),
            ("priya.menon@schoolsync.com",   "Relief request pending",
             "You have a pending relief assignment for CS S3-A data structures."),
            ("arjun.nair@schoolsync.com",    "Leave approved",
             "Your casual leave request has been approved by HOD."),
            ("fatima.khan@schoolsync.com",   "Relief duty assigned",
             "You have been assigned relief duty for an IT department class."),
            ("hod.cs@schoolsync.com",        "New leave application",
             "Priya Menon has submitted a leave request for review."),
            ("hod.cs@schoolsync.com",        "New leave application",
             "Ravi Iyer has submitted a casual leave request."),
            ("hod.ad@schoolsync.com",        "Relief coverage update",
             "Arjun Nair's classes have been fully covered for next week."),
            ("admin@schoolsync.com",         "Timetable published",
             "The 2025-2026 academic year timetable is now active."),
            ("admin@schoolsync.com",         "Weekly report ready",
             "This week's relief coverage report is ready for review."),
        ]
        notif_count = 0
        for email, title, content in notifications_data:
            result = await db.execute(
                select(models.User).filter(models.User.email == email)
            )
            user = result.scalars().first()
            if user:
                notif = models.Notification(
                    user_id=user.id, title=title, content=content
                )
                db.add(notif)
                notif_count += 1
        await db.commit()
        print(f"  ✓ {notif_count} notifications")

        # ============================================================
        # Summary
        # ============================================================
        total = (len(dept_ids) + len(subject_ids) + len(class_ids) + len(room_ids)
                 + len(users_data) + 1 + slot_count + len(absences_data)
                 + relief_count + notif_count)
        print("\n" + "=" * 60)
        print(f"Seeding complete — {total} total records inserted")
        print("=" * 60)
        print("\nDepartments: CS, AD, MECH, EC, AEI, CIVIL, IT, EEE")
        print("Subjects: math, data structures, computer structures,")
        print("          communication for engineers, object-oriented techniques,")
        print("          dbms, mse, minor/honors, operating systems, COI, Python, C")
        print("\nCollege timings (6 teaching periods):")
        print("  P1 08:30-09:40   P2 09:40-10:40   [break 10:40-11:00]")
        print("  P3 11:00-12:00   [lunch 12:00-13:00]")
        print("  P4 13:00-14:00   P5 14:00-15:00   [break 15:00-15:15]")
        print("  P6 15:15-16:15")
        print("\nLogin credentials:")
        print("  Admin:        admin@schoolsync.com           / admin123")
        print("  HOD CS:       hod.cs@schoolsync.com          / hod123")
        print("  HOD AD:       hod.ad@schoolsync.com          / hod123")
        print("  HOD IT:       hod.it@schoolsync.com          / hod123")
        print("  HOD EC:       hod.ec@schoolsync.com          / hod123")
        print("  Teacher:      teacher@schoolsync.com         / teacher123")
        print("  Other teachers: <firstname>.<lastname>@schoolsync.com / pass123")
        print("    priya.menon, ravi.iyer, arjun.nair, lakshmi.rao,")
        print("    fatima.khan, george.mathew, sneha.varma,")
        print("    david.thomas, kiran.joseph, rahul.singh")


if __name__ == "__main__":
    asyncio.run(seed_data())