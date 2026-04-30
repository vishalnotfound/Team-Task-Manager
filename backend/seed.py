from app.database import SessionLocal, engine
from app import models, auth
from datetime import date, timedelta

# Re-create all tables for a clean slate
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # 1. Create Users
    admin_password = auth.get_password_hash("admin123")
    user_password = auth.get_password_hash("user123")
    
    admin_user = models.User(name="Admin Boss", email="admin@test.com", password_hash=admin_password, role=models.RoleEnum.admin)
    member1 = models.User(name="Alice Member", email="alice@test.com", password_hash=user_password, role=models.RoleEnum.member)
    member2 = models.User(name="Bob Member", email="bob@test.com", password_hash=user_password, role=models.RoleEnum.member)
    
    db.add_all([admin_user, member1, member2])
    db.commit()
    
    # Refresh to get IDs
    db.refresh(admin_user)
    db.refresh(member1)
    db.refresh(member2)

    # 2. Create Projects
    project1 = models.Project(name="Website Redesign", description="Redesign the main corporate website.", owner_id=admin_user.id)
    project2 = models.Project(name="Mobile App V2", description="Develop version 2 of our mobile app.", owner_id=admin_user.id)
    
    db.add_all([project1, project2])
    db.commit()
    
    db.refresh(project1)
    db.refresh(project2)

    # 3. Add Members to Projects
    pm1_admin = models.ProjectMember(user_id=admin_user.id, project_id=project1.id)
    pm1_alice = models.ProjectMember(user_id=member1.id, project_id=project1.id)
    
    pm2_admin = models.ProjectMember(user_id=admin_user.id, project_id=project2.id)
    pm2_alice = models.ProjectMember(user_id=member1.id, project_id=project2.id)
    pm2_bob = models.ProjectMember(user_id=member2.id, project_id=project2.id)
    
    db.add_all([pm1_admin, pm1_alice, pm2_admin, pm2_alice, pm2_bob])
    db.commit()

    # 4. Create Tasks
    today = date.today()
    
    # Overdue task
    task1 = models.Task(
        title="Design wireframes", 
        description="Create wireframes for the new homepage.",
        status=models.TaskStatusEnum.todo,
        due_date=today - timedelta(days=2),
        assigned_to=member1.id,
        project_id=project1.id
    )
    
    # In-progress task
    task2 = models.Task(
        title="Setup project repo", 
        description="Initialize the new repository with the base template.",
        status=models.TaskStatusEnum.in_progress,
        due_date=today + timedelta(days=1),
        assigned_to=member1.id,
        project_id=project1.id
    )
    
    # Done task
    task3 = models.Task(
        title="Kickoff meeting", 
        description="Initial kickoff meeting with stakeholders.",
        status=models.TaskStatusEnum.done,
        due_date=today - timedelta(days=5),
        assigned_to=admin_user.id,
        project_id=project1.id
    )
    
    # Bob's task (Project 2)
    task4 = models.Task(
        title="Research auth providers", 
        description="Compare Firebase, Auth0, and custom JWT.",
        status=models.TaskStatusEnum.todo,
        due_date=today + timedelta(days=3),
        assigned_to=member2.id,
        project_id=project2.id
    )

    # Unassigned task
    task5 = models.Task(
        title="Write API Docs", 
        description="Document the new REST API.",
        status=models.TaskStatusEnum.todo,
        due_date=today + timedelta(days=7),
        assigned_to=None,
        project_id=project2.id
    )
    
    db.add_all([task1, task2, task3, task4, task5])
    db.commit()

    print("Seed data successfully injected!")
    db.close()

if __name__ == "__main__":
    seed_data()
