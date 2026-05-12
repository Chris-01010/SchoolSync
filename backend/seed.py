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
        # 1. Create Admin User
        admin_email = "admin@schoolsync.com"
        admin_pass = "admin123"
        
        # Check if exists
        from sqlalchemy import select
        result = await db.execute(select(models.User).filter(models.User.email == admin_email))
        if not result.scalars().first():
            admin_user = models.User(
                college_id="ADM001",
                email=admin_email,
                password_hash=auth.get_password_hash(admin_pass),
                role=models.UserRole.ADMIN
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
                role=models.UserRole.TEACHER
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
                role=models.UserRole.HOD
            )
            db.add(hod_user)
            await db.commit()
            await db.refresh(hod_user)

            hod_profile = models.Teacher(
                user_id=hod_user.id,
                name="Dr. Smith",
                email=hod_email,
                department_id=dept.id,
                weekly_relief_cap=5,
                max_weekly_hours=35
            )
            db.add(hod_profile)
            await db.flush()
            
            # Update department with HOD ID
            dept.hod_id = hod_profile.id
            print(f"Created HOD: {hod_email} / {hod_pass}")
        
        await db.commit()
        print("Seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_data())
