# seed_supabase.py
# Safe seeder for Supabase — NO drop_all, NO create_all
# Run from project root:  python seed_supabase.py

import asyncio
import uuid
from datetime import time, date, timedelta
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import engine, AsyncSessionLocal
from backend import models
from backend import auth


async def seed_data():
    # ── Wipe existing data in FK-safe order (TRUNCATE CASCADE) ────────────────
    async with engine.begin() as conn:
        await conn.execute(text("""
            TRUNCATE TABLE
                relief_assignments,
                blocked_slots,
                timetable_slots,
                timetable_versions,
                absences,
                notifications,
                teachers,
                users,
                subjects,
                departments,
                classes,
                rooms
            RESTART IDENTITY CASCADE;
        """))
    print("  ✓ Cleared all tables\n")

    async with AsyncSessionLocal() as db:
        print("Starting seed...\n")

        # ── Departments ───────────────────────────────────────────────────────
        departments_data = ["CS", "AD", "MECH", "EC", "AEI", "CIVIL", "IT", "EEE"]
        dept_ids = {}
        for name in departments_data:
            d = models.Department(name=name)
            db.add(d)
            await db.flush()
            dept_ids[name] = d.id
        await db.commit()
        print(f"  ✓ {len(dept_ids)} departments")

        # ── Subjects ──────────────────────────────────────────────────────────
        subjects_data = [
            ("math",                        "CS"),
            ("data structures",             "CS"),
            ("computer structures",         "CS"),
            ("communication for engineers", "IT"),
            ("object-oriented techniques",  "CS"),
            ("dbms",                        "IT"),
            ("mse",                         "MECH"),
            ("minor/honors",                "CS"),
            ("operating systems",           "CS"),
            ("COI",                         "CIVIL"),
            ("Python",                      "AD"),
            ("C",                           "IT"),
        ]
        subject_ids = {}
        for name, dept_name in subjects_data:
            subj = models.Subject(name=name, department_id=dept_ids[dept_name])
            db.add(subj)
            await db.flush()
            subject_ids[name] = subj.id
        await db.commit()
        print(f"  ✓ {len(subject_ids)} subjects")

        # ── Classes ───────────────────────────────────────────────────────────
        classes_data = [
            ("CS S3-A",   3, "A"),
            ("CS S3-B",   3, "B"),
            ("CS S5-A",   5, "A"),
            ("AD S3-A",   3, "A"),
            ("AD S5-A",   5, "A"),
            ("IT S3-A",   3, "A"),
            ("IT S5-A",   5, "A"),
            ("EC S3-A",   3, "A"),
            ("MECH S5-A", 5, "A"),
            ("EEE S3-A",  3, "A"),
        ]
        class_ids = {}
        for name, grade, section in classes_data:
            cls = models.ClassRoom(
                name=name, grade=grade, section=section, academic_year="2025-2026"
            )
            db.add(cls)
            await db.flush()
            class_ids[name] = cls.id
        await db.commit()
        print(f"  ✓ {len(class_ids)} classes")

        # ── Rooms ─────────────────────────────────────────────────────────────
        rooms_data = [
            ("Room 101",        60, "Lecture Hall"),
            ("Room 102",        60, "Lecture Hall"),
            ("Room 201",        60, "Lecture Hall"),
            ("Room 202",        60, "Lecture Hall"),
            ("Room 301",        60, "Lecture Hall"),
            ("CS Lab 1",        40, "Computer Lab"),
            ("CS Lab 2",        40, "Computer Lab"),
            ("Electronics Lab", 35, "Electronics Lab"),
            ("Mechanics Lab",   30, "Mechanical Lab"),
            ("Seminar Hall",   120, "Auditorium"),
        ]
        room_ids = {}
        for name, capacity, room_type in rooms_data:
            r = models.Room(name=name, capacity=capacity, room_type=room_type)
            db.add(r)
            await db.flush()
            room_ids[name] = r.id
        await db.commit()
        print(f"  ✓ {len(room_ids)} rooms")

        # ── Users + Teacher profiles ──────────────────────────────────────────
        users_data = [
            # college_id, email, pwd, role, name, dept, cap, hrs
            ("ADM001", "admin@schoolsync.com",         "admin123",   "admin",   None,                None,    None, None),
            ("HOD001", "hod.cs@schoolsync.com",        "hod123",     "hod",     "Dr. Anita Sharma",  "CS",    5,    35),
            ("HOD002", "hod.ad@schoolsync.com",        "hod123",     "hod",     "Dr. Rajesh Kumar",  "AD",    5,    35),
            ("HOD003", "hod.it@schoolsync.com",        "hod123",     "hod",     "Dr. Meera Pillai",  "IT",    5,    35),
            ("HOD004", "hod.ec@schoolsync.com",        "hod123",     "hod",     "Dr. Vikram Reddy",  "EC",    5,    35),
            ("TCH001", "teacher@schoolsync.com",       "teacher123", "teacher", "John Doe",          "CS",    3,    30),
            ("TCH002", "priya.menon@schoolsync.com",   "pass123",    "teacher", "Priya Menon",       "CS",    3,    30),
            ("TCH003", "ravi.iyer@schoolsync.com",     "pass123",    "teacher", "Ravi Iyer",         "CS",    3,    30),
            ("TCH004", "arjun.nair@schoolsync.com",    "pass123",    "teacher", "Arjun Nair",        "AD",    3,    30),
            ("TCH005", "lakshmi.rao@schoolsync.com",   "pass123",    "teacher", "Lakshmi Rao",       "IT",    3,    30),
            ("TCH006", "fatima.khan@schoolsync.com",   "pass123",    "teacher", "Fatima Khan",       "IT",    3,    30),
            ("TCH007", "george.mathew@schoolsync.com", "pass123",    "teacher", "George Mathew",     "EC",    3,    30),
            ("TCH008", "sneha.varma@schoolsync.com",   "pass123",    "teacher", "Sneha Varma",       "AEI",   3,    30),
            ("TCH009", "david.thomas@schoolsync.com",  "pass123",    "teacher", "David Thomas",      "MECH",  3,    30),
            ("TCH010", "kiran.joseph@schoolsync.com",  "pass123",    "teacher", "Kiran Joseph",      "CIVIL", 3,    30),
            ("TCH011", "rahul.singh@schoolsync.com",   "pass123",    "teacher", "Rahul Singh",       "EEE",   3,    30),
        ]

        teacher_ids = {}
        for college_id, email, pwd, role, name, dept_name, cap, hrs in users_data:
            role_enum = {
                "admin":   models.UserRole.ADMIN,
                "hod":     models.UserRole.HOD,
                "teacher": models.UserRole.TEACHER,
            }[role]
            user = models.User(
                college_id=college_id,
                email=email,
                password_hash=auth.get_password_hash(pwd),
                role=role_enum,
                is_verified=True,
            )
            db.add(user)
            await db.flush()

            if role != "admin":
                teacher = models.Teacher(
                    user_id=user.id,
                    name=name,
                    email=email,
                    department_id=dept_ids[dept_name],
                    weekly_relief_cap=cap,
                    max_weekly_hours=hrs,
                    current_relief_hours=0,
                    total_hours_worked=0,
                    is_active=True,
                    blocked_slots={},
                )
                db.add(teacher)
                await db.flush()
                teacher_ids[name] = teacher.id

        await db.commit()
        print(f"  ✓ {len(users_data)} users / {len(teacher_ids)} teacher profiles")

        # ── Link HODs to departments ──────────────────────────────────────────
        hod_dept_mapping = [
            ("CS", "Dr. Anita Sharma"),
            ("AD", "Dr. Rajesh Kumar"),
            ("IT", "Dr. Meera Pillai"),
            ("EC", "Dr. Vikram Reddy"),
        ]
        for dept_name, hod_name in hod_dept_mapping:
            result = await db.execute(
                select(models.Department).where(models.Department.name == dept_name)
            )
            d = result.scalars().first()
            d.hod_id = teacher_ids[hod_name]
        await db.commit()
        print(f"  ✓ {len(hod_dept_mapping)} HODs linked to departments")

        # ── Timetable version ─────────────────────────────────────────────────
        tt_version = models.TimetableVersion(
            school_id=uuid.uuid4(),
            published_by=teacher_ids["Dr. Anita Sharma"],
            is_active=True,
            data_snapshot={},
        )
        db.add(tt_version)
        await db.flush()
        tt_version_id = tt_version.id
        await db.commit()
        print("  ✓ 1 timetable version (active)")

        # ── Timetable slots ───────────────────────────────────────────────────
        period_times = {
            1: ("08:30", "09:40"),
            2: ("09:40", "10:40"),
            3: ("11:00", "12:00"),
            4: ("13:00", "14:00"),
            5: ("14:00", "15:00"),
            6: ("15:15", "16:15"),
        }

        # John Doe — full week, CS dept
        john_schedule = [
            (0, 1, "data structures",            "CS S3-A",  "Room 101"),
            (0, 2, "data structures",            "CS S3-B",  "Room 102"),
            (0, 3, "object-oriented techniques", "CS S5-A",  "Room 201"),
            (0, 4, "data structures",            "CS S3-A",  "CS Lab 1"),
            (0, 5, "data structures",            "CS S3-B",  "CS Lab 1"),
            (0, 6, "operating systems",          "CS S5-A",  "Room 201"),
            (1, 1, "operating systems",          "CS S5-A",  "Room 201"),
            (1, 2, "object-oriented techniques", "IT S5-A",  "Room 301"),
            (1, 3, "data structures",            "AD S3-A",  "Room 102"),
            (1, 4, "computer structures",        "CS S3-A",  "Room 101"),
            (1, 5, "computer structures",        "CS S3-B",  "Room 102"),
            (1, 6, "minor/honors",               "CS S5-A",  "Seminar Hall"),
            (2, 1, "data structures",            "CS S3-A",  "CS Lab 2"),
            (2, 2, "data structures",            "AD S3-A",  "CS Lab 2"),
            (2, 3, "object-oriented techniques", "CS S5-A",  "CS Lab 1"),
            (2, 4, "operating systems",          "IT S5-A",  "Room 301"),
            (2, 5, "computer structures",        "CS S3-A",  "Room 101"),
            (2, 6, "data structures",            "CS S3-B",  "CS Lab 2"),
            (3, 1, "object-oriented techniques", "CS S5-A",  "Room 201"),
            (3, 2, "data structures",            "CS S3-A",  "Room 101"),
            (3, 3, "operating systems",          "CS S5-A",  "Room 201"),
            (3, 4, "data structures",            "CS S3-B",  "Room 102"),
            (3, 5, "object-oriented techniques", "IT S5-A",  "Room 301"),
            (3, 6, "computer structures",        "AD S3-A",  "Room 202"),
            (4, 1, "operating systems",          "CS S5-A",  "Room 201"),
            (4, 2, "data structures",            "CS S3-A",  "Room 101"),
            (4, 3, "object-oriented techniques", "CS S5-A",  "CS Lab 1"),
            (4, 4, "computer structures",        "CS S3-B",  "Room 102"),
            (4, 5, "data structures",            "AD S3-A",  "Room 202"),
            (4, 6, "minor/honors",               "CS S5-A",  "Seminar Hall"),
        ]

        # Priya Menon — CS dept, teaches data structures and OOP
        priya_schedule = [
            (0, 1, "data structures",            "EEE S3-A",  "Mechanics Lab"),
            (0, 2, "object-oriented techniques", "MECH S5-A", "Mechanics Lab"),  # ← ADD
            (0, 3, "data structures",            "IT S3-A",   "Mechanics Lab"),  # ← ADD (was day=2,period=5)
            (1, 3, "object-oriented techniques", "MECH S5-A", "Room 201"),
            (2, 5, "data structures",            "IT S3-A",   "Electronics Lab"),
            (3, 2, "operating systems",          "EC S3-A",   "Room 101"),
        ]

        # Ravi Iyer — CS dept, teaches computer structures and data structures
        ravi_schedule = [
            (0, 3, "computer structures",  "AD S5-A",  "Electronics Lab"),
            (1, 5, "data structures",      "EEE S3-A", "Electronics Lab"),
            (3, 4, "computer structures",  "IT S3-A",  "Electronics Lab"),
        ]

        slot_count = 0

        def add_slots(schedule, teacher_name):
            nonlocal slot_count
            for day, period, subj, cls, room in schedule:
                start, end = period_times[period]
                s = models.TimetableSlot(
                    timetable_version_id=tt_version_id,
                    teacher_id=teacher_ids[teacher_name],
                    class_id=class_ids[cls],
                    room_id=room_ids[room],
                    subject_id=subject_ids[subj],
                    day_of_week=day,
                    period=period,
                    start_time=time.fromisoformat(start),
                    end_time=time.fromisoformat(end),
                    is_relief=False,
                )
                db.add(s)
                slot_count += 1

        add_slots(john_schedule,  "John Doe")
        add_slots(priya_schedule, "Priya Menon")
        add_slots(ravi_schedule,  "Ravi Iyer")
        await db.commit()
        print(f"  ✓ {slot_count} timetable slots")

        # ── Absences ──────────────────────────────────────────────────────────
        today = date.today()
        days_since_tuesday = (today.weekday() - 1) % 7
        last_tuesday = today - timedelta(days=days_since_tuesday)

        absences_data = [
            # name, date, p_start, p_end, leave_type, reason, status
            ("Priya Menon",   today + timedelta(days=2), 1, 3, "Sick Leave",     "Fever",            models.AbsenceStatus.PENDING),
            ("Ravi Iyer",     today + timedelta(days=3), 1, 6, "Casual Leave",   "Wedding",          models.AbsenceStatus.PENDING),
            ("Fatima Khan",   today + timedelta(days=1), 4, 6, "Personal Leave", "Urgent matter",    models.AbsenceStatus.PENDING),
            ("Arjun Nair",    today + timedelta(days=5), 1, 6, "Casual Leave",   "Family function",  models.AbsenceStatus.APPROVED),
            ("Lakshmi Rao",   today + timedelta(days=7), 1, 6, "Earned Leave",   "Annual vacation",  models.AbsenceStatus.APPROVED),
            ("John Doe",      last_tuesday,              3, 5, "Sick Leave",     "Migraine",         models.AbsenceStatus.APPROVED),
            ("George Mathew", today - timedelta(days=5), 1, 3, "Sick Leave",     "Flu",              models.AbsenceStatus.APPROVED),
            ("Sneha Varma",   today + timedelta(days=4), 1, 2, "Personal Leave", "Bank appointment", models.AbsenceStatus.REJECTED),
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
            db.add(absence)
            await db.flush()
            absence_ids[name] = absence.id
        await db.commit()
        print(f"  ✓ {len(absences_data)} absence records")

        # ── Relief assignments ─────────────────────────────────────────────────
        relief_data = [
            ("Arjun Nair",    "Lakshmi Rao",  88, models.ReliefStatus.ACCEPTED, "AD/IT cross-coverage"),
            ("Lakshmi Rao",   "Fatima Khan",  85, models.ReliefStatus.PENDING,  "Same IT dept, free P4-P6"),
            ("John Doe",      "Priya Menon",  92, models.ReliefStatus.ACCEPTED, "Same CS dept, OOP expertise"),
            ("George Mathew", "Sneha Varma",  90, models.ReliefStatus.ACCEPTED, "EC/AEI cross-coverage"),
            ("Priya Menon",   "Ravi Iyer",    78, models.ReliefStatus.PENDING,  "Same CS dept, DS expertise"),
            ("Fatima Khan",   "Lakshmi Rao",  82, models.ReliefStatus.PENDING,  "IT dept colleague, free P4-P6"),
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

        # ── Notifications ─────────────────────────────────────────────────────
        notifications_data = [
            ("teacher@schoolsync.com",     "Relief assignment confirmed",  "You have been assigned to cover P3 CS S5-A on Tuesday."),
            ("teacher@schoolsync.com",     "Leave application approved",   "Your sick leave has been approved."),
            ("priya.menon@schoolsync.com", "Relief request pending",       "You have a pending relief assignment."),
            ("hod.cs@schoolsync.com",      "New leave application",        "Priya Menon submitted a leave request."),
            ("hod.cs@schoolsync.com",      "New leave application",        "Ravi Iyer submitted a casual leave request."),
            ("admin@schoolsync.com",       "Timetable published",          "The 2025-2026 timetable is now active."),
        ]
        notif_count = 0
        for email, title, content in notifications_data:
            result = await db.execute(
                select(models.User).where(models.User.email == email)
            )
            user = result.scalars().first()
            if user:
                db.add(models.Notification(user_id=user.id, title=title, content=content))
                notif_count += 1
        await db.commit()
        print(f"  ✓ {notif_count} notifications")

        print("\n" + "=" * 55)
        print("Seed complete ✓")
        print("=" * 55)
        print("\nLogin credentials:")
        print("  Admin   : admin@schoolsync.com  / admin123")
        print("  HOD CS  : hod.cs@schoolsync.com / hod123")
        print("  Teacher : teacher@schoolsync.com / teacher123")
        print("  Others  : <email> / pass123")


if __name__ == "__main__":
    asyncio.run(seed_data())