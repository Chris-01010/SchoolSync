import asyncio
import uuid
from datetime import time, date, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from .database import engine, Base, AsyncSessionLocal
from . import models
from . import auth


async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("Starting seed...\n")

        # ============================================================
        # GROUP A — Departments (8)
        # ============================================================
        departments_data = ["CS", "AD", "MECH", "EC", "AEI", "CIVIL", "IT", "EEE"]
        dept_ids = {}
        for name in departments_data:
            d = models.Department(name=name)
            db.add(d)
            await db.flush()
            dept_ids[name] = d.id
        await db.commit()
        print(f"  ✓ {len(dept_ids)} departments")

        # ============================================================
        # GROUP B — Subjects/Courses (12)
        # ============================================================
        subjects_data = [
            ("math",                       "CS"),
            ("data structures",            "CS"),
            ("computer structures",        "CS"),
            ("communication for engineers","IT"),
            ("object-oriented techniques", "CS"),
            ("dbms",                       "IT"),
            ("mse",                        "MECH"),
            ("minor/honors",               "CS"),
            ("operating systems",          "CS"),
            ("COI",                        "CIVIL"),
            ("Python",                     "AD"),
            ("C",                          "IT"),
        ]
        subject_ids = {}
        for name, dept_name in subjects_data:
            subj = models.Subject(name=name, department_id=dept_ids[dept_name])
            db.add(subj)
            await db.flush()
            subject_ids[name] = subj.id
        await db.commit()
        print(f"  ✓ {len(subject_ids)} subjects")

        # ============================================================
        # GROUP C — Classes (10) — engineering batches
        # ============================================================
        classes_data = [
            ("CS S3-A",    3, "A"),
            ("CS S3-B",    3, "B"),
            ("CS S5-A",    5, "A"),
            ("AD S3-A",    3, "A"),
            ("AD S5-A",    5, "A"),
            ("IT S3-A",    3, "A"),
            ("IT S5-A",    5, "A"),
            ("EC S3-A",    3, "A"),
            ("MECH S5-A",  5, "A"),
            ("EEE S3-A",   3, "A"),
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

        # ============================================================
        # GROUP D — Rooms (10)
        # ============================================================
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

        # ============================================================
        # GROUP E — Users & Teacher profiles (16)
        # ============================================================
        users_data = [
            # (college_id, email, password, role, name, dept, cap, hrs)
            ("ADM001", "admin@schoolsync.com",            "admin123",   "admin",   None,                   None,    None, None),
            ("HOD001", "hod.cs@schoolsync.com",           "hod123",     "hod",     "Dr. Anita Sharma",     "CS",    5,    35),
            ("HOD002", "hod.ad@schoolsync.com",           "hod123",     "hod",     "Dr. Rajesh Kumar",     "AD",    5,    35),
            ("HOD003", "hod.it@schoolsync.com",           "hod123",     "hod",     "Dr. Meera Pillai",     "IT",    5,    35),
            ("HOD004", "hod.ec@schoolsync.com",           "hod123",     "hod",     "Dr. Vikram Reddy",     "EC",    5,    35),
            ("TCH001", "teacher@schoolsync.com",          "teacher123", "teacher", "John Doe",             "CS",    3,    30),
            ("TCH002", "priya.menon@schoolsync.com",      "pass123",    "teacher", "Priya Menon",          "CS",    3,    30),
            ("TCH003", "ravi.iyer@schoolsync.com",        "pass123",    "teacher", "Ravi Iyer",            "CS",    3,    30),
            ("TCH004", "arjun.nair@schoolsync.com",       "pass123",    "teacher", "Arjun Nair",           "AD",    3,    30),
            ("TCH005", "lakshmi.rao@schoolsync.com",      "pass123",    "teacher", "Lakshmi Rao",          "IT",    3,    30),
            ("TCH006", "fatima.khan@schoolsync.com",      "pass123",    "teacher", "Fatima Khan",          "IT",    3,    30),
            ("TCH007", "george.mathew@schoolsync.com",    "pass123",    "teacher", "George Mathew",        "EC",    3,    30),
            ("TCH008", "sneha.varma@schoolsync.com",      "pass123",    "teacher", "Sneha Varma",          "AEI",   3,    30),
            ("TCH009", "david.thomas@schoolsync.com",     "pass123",    "teacher", "David Thomas",         "MECH",  3,    30),
            ("TCH010", "kiran.joseph@schoolsync.com",     "pass123",    "teacher", "Kiran Joseph",         "CIVIL", 3,    30),
            ("TCH011", "rahul.singh@schoolsync.com",      "pass123",    "teacher", "Rahul Singh",          "EEE",   3,    30),
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
                )
                db.add(teacher)
                await db.flush()
                teacher_ids[name] = teacher.id

        await db.commit()
        print(f"  ✓ {len(users_data)} users ({len(teacher_ids)} teacher profiles)")

        # Link HODs to departments
        hod_dept_mapping = [
            ("CS", "Dr. Anita Sharma"),
            ("AD", "Dr. Rajesh Kumar"),
            ("IT", "Dr. Meera Pillai"),
            ("EC", "Dr. Vikram Reddy"),
        ]
        for dept_name, hod_name in hod_dept_mapping:
            result = await db.execute(
                select(models.Department).filter(models.Department.name == dept_name)
            )
            d = result.scalars().first()
            d.hod_id = teacher_ids[hod_name]
        await db.commit()
        print(f"  ✓ Linked {len(hod_dept_mapping)} HODs to departments")

        # ============================================================
        # GROUP F — Timetable Version (1)
        # ============================================================
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
        print(f"  ✓ 1 timetable version (active)")

        # ============================================================
        # GROUP G — Timetable Slots
        # College timings — 6 teaching periods per day:
        #   P1 08:30–09:40   P2 09:40–10:40   [break 10:40–11:00]
        #   P3 11:00–12:00   [lunch 12:00–13:00]
        #   P4 13:00–14:00   P5 14:00–15:00   [break 15:00–15:15]
        #   P6 15:15–16:15
        # ============================================================
        period_times = {
            1: ("08:30", "09:40"),
            2: ("09:40", "10:40"),
            3: ("11:00", "12:00"),
            4: ("13:00", "14:00"),
            5: ("14:00", "15:00"),
            6: ("15:15", "16:15"),
        }

        # John Doe's full week (Mon-Fri = 0-4) × 6 periods = 30 slots
        john_schedule = [
            # Monday
            (0, 1, "data structures",            "CS S3-A",   "Room 101"),
            (0, 2, "data structures",            "CS S3-B",   "Room 102"),
            (0, 3, "object-oriented techniques", "CS S5-A",   "Room 201"),
            (0, 4, "data structures",            "CS S3-A",   "CS Lab 1"),
            (0, 5, "data structures",            "CS S3-B",   "CS Lab 1"),
            (0, 6, "operating systems",          "CS S5-A",   "Room 201"),
            # Tuesday
            (1, 1, "operating systems",          "CS S5-A",   "Room 201"),
            (1, 2, "object-oriented techniques", "IT S5-A",   "Room 301"),
            (1, 3, "data structures",            "AD S3-A",   "Room 102"),
            (1, 4, "computer structures",        "CS S3-A",   "Room 101"),
            (1, 5, "computer structures",        "CS S3-B",   "Room 102"),
            (1, 6, "minor/honors",               "CS S5-A",   "Seminar Hall"),
            # Wednesday
            (2, 1, "data structures",            "CS S3-A",   "CS Lab 2"),
            (2, 2, "data structures",            "AD S3-A",   "CS Lab 2"),
            (2, 3, "object-oriented techniques", "CS S5-A",   "CS Lab 1"),
            (2, 4, "operating systems",          "IT S5-A",   "Room 301"),
            (2, 5, "computer structures",        "CS S3-A",   "Room 101"),
            (2, 6, "data structures",            "CS S3-B",   "CS Lab 2"),
            # Thursday
            (3, 1, "object-oriented techniques", "CS S5-A",   "Room 201"),
            (3, 2, "data structures",            "CS S3-A",   "Room 101"),
            (3, 3, "operating systems",          "CS S5-A",   "Room 201"),
            (3, 4, "data structures",            "CS S3-B",   "Room 102"),
            (3, 5, "object-oriented techniques", "IT S5-A",   "Room 301"),
            (3, 6, "computer structures",        "AD S3-A",   "Room 202"),
            # Friday
            (4, 1, "operating systems",          "CS S5-A",   "Room 201"),
            (4, 2, "data structures",            "CS S3-A",   "Room 101"),
            (4, 3, "object-oriented techniques", "CS S5-A",   "CS Lab 1"),
            (4, 4, "computer structures",        "CS S3-B",   "Room 102"),
            (4, 5, "data structures",            "AD S3-A",   "Room 202"),
            (4, 6, "minor/honors",               "CS S5-A",   "Seminar Hall"),
        ]

        slot_count = 0
        for day, period, subj, cls, room in john_schedule:
            start, end = period_times[period]
            slot = models.TimetableSlot(
                timetable_version_id=tt_version_id,
                teacher_id=teacher_ids["John Doe"],
                class_id=class_ids[cls],
                room_id=room_ids[room],
                subject_id=subject_ids[subj],
                day_of_week=day,
                period=period,
                start_time=time.fromisoformat(start),
                end_time=time.fromisoformat(end),
                is_relief=False,
            )
            db.add(slot)
            slot_count += 1

        await db.commit()
        print(f"  ✓ {slot_count} timetable slots (John Doe full week, 6 periods/day)")

        # ============================================================
        # GROUP H — Absences / Leave Applications (8)
        # ============================================================
        today = date.today()
        absences_data = [
            ("Priya Menon",    2,   1, 3, "Sick Leave",     "Fever and rest advised by doctor",   models.AbsenceStatus.PENDING),
            ("Ravi Iyer",      3,   1, 6, "Casual Leave",   "Wedding in family",                  models.AbsenceStatus.PENDING),
            ("Fatima Khan",    1,   4, 6, "Personal Leave", "Urgent personal matter",             models.AbsenceStatus.PENDING),
            ("Arjun Nair",     5,   1, 6, "Casual Leave",   "Family function",                    models.AbsenceStatus.APPROVED),
            ("Lakshmi Rao",    7,   1, 6, "Earned Leave",   "Annual vacation",                    models.AbsenceStatus.APPROVED),
            ("John Doe",      -3,   3, 5, "Sick Leave",     "Migraine",                           models.AbsenceStatus.APPROVED),
            ("George Mathew", -5,   1, 3, "Sick Leave",     "Flu",                                models.AbsenceStatus.APPROVED),
            ("Sneha Varma",    4,   1, 2, "Personal Leave", "Bank appointment",                   models.AbsenceStatus.REJECTED),
        ]
        absence_ids = {}
        for name, offset, p_start, p_end, leave_type, reason, status in absences_data:
            abs_date = today + timedelta(days=offset)
            absence = models.Absence(
                teacher_id=teacher_ids[name],
                date=abs_date,
                period_start=p_start,
                period_end=p_end,
                leave_type=leave_type,
                reason=reason,
                status=status,
                resolved=(status == models.AbsenceStatus.APPROVED and offset < 0),
            )
            db.add(absence)
            await db.flush()
            absence_ids[f"{name}_{offset}"] = absence.id
        await db.commit()
        print(f"  ✓ {len(absences_data)} absence records")

        # ============================================================
        # GROUP I — Relief Assignments (6)
        # ============================================================
        relief_data = [
            ("Arjun Nair_5",     "Lakshmi Rao",   88, models.ReliefStatus.ACCEPTED, "AD/IT cross-coverage, available all day"),
            ("Lakshmi Rao_7",    "Fatima Khan",   85, models.ReliefStatus.PENDING,  "Same IT department, free during P4-P6"),
            ("John Doe_-3",      "Priya Menon",   92, models.ReliefStatus.ACCEPTED, "Same CS department, OOP expertise"),
            ("George Mathew_-5", "Sneha Varma",   90, models.ReliefStatus.ACCEPTED, "EC/AEI cross-coverage, low weekly load"),
            ("Priya Menon_2",    "Ravi Iyer",     78, models.ReliefStatus.PENDING,  "Same CS dept, data structures expertise"),
            ("Fatima Khan_1",    "Lakshmi Rao",   82, models.ReliefStatus.PENDING,  "IT dept colleague, free periods P4-P6"),
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
            ("teacher@schoolsync.com",          "Relief assignment confirmed",
             "You have been assigned to cover P3 (11:00-12:00), CS S5-A on Friday."),
            ("teacher@schoolsync.com",          "Leave application approved",
             "Your sick leave request for last week has been approved."),
            ("priya.menon@schoolsync.com",      "Relief request pending",
             "You have a pending relief assignment for CS S3-A data structures."),
            ("arjun.nair@schoolsync.com",       "Leave approved",
             "Your casual leave request has been approved by HOD."),
            ("fatima.khan@schoolsync.com",      "Relief duty assigned",
             "You have been assigned relief duty for an IT department class."),
            ("hod.cs@schoolsync.com",           "New leave application",
             "Priya Menon has submitted a leave request for review."),
            ("hod.cs@schoolsync.com",           "New leave application",
             "Ravi Iyer has submitted a casual leave request."),
            ("hod.ad@schoolsync.com",           "Relief coverage update",
             "Arjun Nair's classes have been fully covered for next week."),
            ("admin@schoolsync.com",            "Timetable published",
             "The 2025-2026 academic year timetable is now active."),
            ("admin@schoolsync.com",            "Weekly report ready",
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
