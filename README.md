# SchoolSync

> AI-powered school administration platform for automated timetable generation and relief teacher management.

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

## Key Features

- **AI-Powered Timetable Generation** — Google OR-Tools CP-SAT solver generates conflict-free schedules respecting teacher availability, room capacity, and workload constraints.
- **Automated Relief Management** — Fairness-aware ranking algorithm assigns relief teachers in seconds during staff absences.
- **Role-Based Portals** — Dedicated dashboards for Admins, HODs, and Teachers with appropriate access controls.
- **Leave Workflow** — Teachers submit leave requests; HODs approve/reject with departmental oversight.
- **Modern UI** — Premium responsive dashboard built with React, Tailwind CSS, and Framer Motion.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy 2.0 (async), Pydantic |
| Database | PostgreSQL (prod) / SQLite (dev) |
| Solver | Google OR-Tools (CP-SAT) |
| Worker | Celery + Redis |
| Frontend | Vite, React 19, Tailwind CSS 3, Framer Motion |
| Auth | JWT (python-jose), RBAC via dependencies |
| Deploy | Docker, Docker Compose |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Redis (for Celery worker, optional for dev)

### Local Development

```bash
# Clone
git clone https://github.com/Chris-01010/SchoolSync.git
cd SchoolSync

# Backend
cd backend
pip install -r requirements.txt
python seed.py          # Initialize DB with test data
uvicorn main:app --reload

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

### Docker Deployment

```bash
docker-compose up --build
```

### Test Accounts (after seeding)

| Role | College ID | Password |
|------|-----------|----------|
| Admin | ADM001 | admin123 |
| Teacher | TCH001 | teacher123 |
| HOD | HOD001 | hod123 |

## Project Structure

```
SchoolSync/
├── backend/
│   ├── main.py          # FastAPI application & routes
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── auth.py          # JWT authentication & RBAC
│   ├── solver.py        # OR-Tools timetable solver
│   ├── worker.py        # Celery background tasks
│   ├── relief.py        # Relief teacher ranking algorithm
│   ├── reports.py       # Audit report generation
│   ├── database.py      # Async engine & session config
│   ├── seed.py          # Database seeder
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/  # Dashboard components
│   │   └── pages/       # Auth page
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml
└── README.md
```

## License

MIT
