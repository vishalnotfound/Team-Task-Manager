Team Task Manager  ::=> Live Link : https://team-task-manager-production-7c5f.up.railway.app/login
=================

Team Task Manager is a full-stack web application designed to help teams organize projects and track tasks efficiently. 

It features Role-Based Access Control (RBAC) with Admins and Members:
- Admins can create new projects, add team members to projects, assign tasks, and view global dashboards showing total projects and task statuses.
- Members can view projects they belong to, see tasks assigned to them, update task statuses (Todo, In-Progress, Done), and view their personal dashboard.

Tech Stack:
- Backend: FastAPI (Python), SQLAlchemy, PostgreSQL
- Frontend: React, Vite, React Router, CSS

How to Start the Application
============================

Prerequisites:
- Python 3.x
- Node.js (v18 or higher recommended)

1. Backend Setup
----------------
Open a terminal and navigate to the `backend` directory:
   cd backend

Create a virtual environment:
   python -m venv .venv

Activate the virtual environment:
   Windows: .venv\Scripts\activate
   Mac/Linux: source .venv/bin/activate

Install dependencies:
   pip install -r requirements.txt

Start the backend server:
   fastapi dev app/main.py
   (Alternatively: uvicorn app.main:app --reload)

Note: On the first run, the database tables and sample data will be automatically generated.
The backend API will run on http://localhost:8000.

Default Accounts (created via auto-seeding):
- Admin Account:
  Email: admin@test.com
  Password: admin123
- Member Accounts:
  Email: alice@test.com (or bob@test.com, carol@test.com)
  Password: user123


2. Frontend Setup
-----------------
Open a new terminal and navigate to the `frontend` directory:
   cd frontend

Install Node dependencies:
   npm install

Start the development server:
   npm run dev

Open your browser and navigate to the URL shown in the terminal (usually http://localhost:5173). 
You can log in using the default accounts listed above to explore the application.
