"""Auto-seed module -- populates the database with sample data if empty."""
from sqlalchemy.orm import Session
from datetime import date, timedelta
from . import models, auth


def seed_if_empty(db: Session):
    """Only seeds if there are zero users in the database."""
    if db.query(models.User).count() > 0:
        return  # Already has data, skip

    print("[SEED] Database is empty -- seeding sample data...")

    # -- Users --
    admin_hash = auth.get_password_hash("admin123")
    member_hash = auth.get_password_hash("user123")

    admin = models.User(name="Admin Boss", email="admin@test.com", password_hash=admin_hash, role=models.RoleEnum.admin)
    alice = models.User(name="Alice Engineer", email="alice@test.com", password_hash=member_hash, role=models.RoleEnum.member)
    bob = models.User(name="Bob Designer", email="bob@test.com", password_hash=member_hash, role=models.RoleEnum.member)
    carol = models.User(name="Carol PM", email="carol@test.com", password_hash=member_hash, role=models.RoleEnum.member)

    db.add_all([admin, alice, bob, carol])
    db.commit()
    for u in [admin, alice, bob, carol]:
        db.refresh(u)

    # -- Projects --
    p1 = models.Project(name="Website Redesign", description="Redesign the main corporate website with modern UI and responsive layout.", owner_id=admin.id)
    p2 = models.Project(name="Product Launch", description="Plan and execute the Q2 product launch across all channels.", owner_id=admin.id)
    p3 = models.Project(name="Internal Tool", description="Build internal dashboard for team analytics and reporting.", owner_id=admin.id)
    p4 = models.Project(name="Mobile App V2", description="Develop version 2 of the mobile app with new features and performance improvements.", owner_id=admin.id)

    db.add_all([p1, p2, p3, p4])
    db.commit()
    for p in [p1, p2, p3, p4]:
        db.refresh(p)

    # -- Project Members --
    members = [
        models.ProjectMember(user_id=admin.id, project_id=p1.id),
        models.ProjectMember(user_id=alice.id, project_id=p1.id),
        models.ProjectMember(user_id=bob.id, project_id=p1.id),
        models.ProjectMember(user_id=admin.id, project_id=p2.id),
        models.ProjectMember(user_id=alice.id, project_id=p2.id),
        models.ProjectMember(user_id=carol.id, project_id=p2.id),
        models.ProjectMember(user_id=admin.id, project_id=p3.id),
        models.ProjectMember(user_id=bob.id, project_id=p3.id),
        models.ProjectMember(user_id=carol.id, project_id=p3.id),
        models.ProjectMember(user_id=admin.id, project_id=p4.id),
        models.ProjectMember(user_id=alice.id, project_id=p4.id),
        models.ProjectMember(user_id=bob.id, project_id=p4.id),
        models.ProjectMember(user_id=carol.id, project_id=p4.id),
    ]
    db.add_all(members)
    db.commit()

    # -- Tasks (6 per project = 24 total) --
    today = date.today()
    tasks = [
        # Website Redesign (p1)
        models.Task(title="Design login page", description="Create responsive login UI.", status=models.TaskStatusEnum.in_progress, due_date=today + timedelta(days=2), assigned_to=bob.id, project_id=p1.id),
        models.Task(title="Fix API integration bug", description="Resolve user data fetch issue.", status=models.TaskStatusEnum.todo, due_date=today - timedelta(days=1), assigned_to=alice.id, project_id=p1.id),
        models.Task(title="Implement responsive navbar", description="Build mobile hamburger menu.", status=models.TaskStatusEnum.done, due_date=today - timedelta(days=5), assigned_to=alice.id, project_id=p1.id),
        models.Task(title="Build hero section", description="Implement hero banner with CTA.", status=models.TaskStatusEnum.in_progress, due_date=today + timedelta(days=3), assigned_to=bob.id, project_id=p1.id),
        models.Task(title="Setup CI/CD pipeline", description="Configure GitHub Actions deploy.", status=models.TaskStatusEnum.todo, due_date=today + timedelta(days=7), assigned_to=None, project_id=p1.id),
        models.Task(title="Fix payment gateway issue", description="Debug Stripe webhook failures.", status=models.TaskStatusEnum.todo, due_date=today - timedelta(days=3), assigned_to=alice.id, project_id=p1.id),

        # Product Launch (p2)
        models.Task(title="Create project setup flow", description="Build project onboarding steps.", status=models.TaskStatusEnum.in_progress, due_date=today + timedelta(days=5), assigned_to=carol.id, project_id=p2.id),
        models.Task(title="Write unit tests", description="Add tests for auth modules.", status=models.TaskStatusEnum.done, due_date=today - timedelta(days=7), assigned_to=alice.id, project_id=p2.id),
        models.Task(title="Prepare release notes", description="Document all v2.0 changes.", status=models.TaskStatusEnum.todo, due_date=today - timedelta(days=2), assigned_to=carol.id, project_id=p2.id),
        models.Task(title="Design email templates", description="Create launch announcement emails.", status=models.TaskStatusEnum.done, due_date=today - timedelta(days=10), assigned_to=bob.id, project_id=p2.id),
        models.Task(title="Setup analytics tracking", description="Implement Mixpanel event tracking.", status=models.TaskStatusEnum.todo, due_date=today + timedelta(days=4), assigned_to=alice.id, project_id=p2.id),
        models.Task(title="Social media campaign", description="Schedule launch posts on all platforms.", status=models.TaskStatusEnum.in_progress, due_date=today + timedelta(days=1), assigned_to=carol.id, project_id=p2.id),

        # Internal Tool (p3)
        models.Task(title="Update documentation", description="Update API docs and README.", status=models.TaskStatusEnum.done, due_date=today - timedelta(days=3), assigned_to=bob.id, project_id=p3.id),
        models.Task(title="Deploy to production", description="Deploy the application.", status=models.TaskStatusEnum.todo, due_date=today - timedelta(days=8), assigned_to=carol.id, project_id=p3.id),
        models.Task(title="Build dashboard charts", description="Implement Chart.js analytics views.", status=models.TaskStatusEnum.in_progress, due_date=today + timedelta(days=2), assigned_to=bob.id, project_id=p3.id),
        models.Task(title="Add role permissions UI", description="Admin panel for role management.", status=models.TaskStatusEnum.todo, due_date=today + timedelta(days=6), assigned_to=alice.id, project_id=p3.id),
        models.Task(title="Database optimization", description="Add indexes and query optimization.", status=models.TaskStatusEnum.done, due_date=today - timedelta(days=12), assigned_to=carol.id, project_id=p3.id),
        models.Task(title="Setup error monitoring", description="Integrate Sentry for error tracking.", status=models.TaskStatusEnum.todo, due_date=today + timedelta(days=9), assigned_to=None, project_id=p3.id),

        # Mobile App V2 (p4)
        models.Task(title="Design onboarding flow", description="Create 3-step onboarding screens.", status=models.TaskStatusEnum.in_progress, due_date=today + timedelta(days=3), assigned_to=bob.id, project_id=p4.id),
        models.Task(title="Implement push notifications", description="Setup Firebase Cloud Messaging.", status=models.TaskStatusEnum.todo, due_date=today + timedelta(days=8), assigned_to=alice.id, project_id=p4.id),
        models.Task(title="Offline mode support", description="Cache data for offline access.", status=models.TaskStatusEnum.todo, due_date=today + timedelta(days=12), assigned_to=carol.id, project_id=p4.id),
        models.Task(title="Performance profiling", description="Identify and fix render bottlenecks.", status=models.TaskStatusEnum.in_progress, due_date=today + timedelta(days=1), assigned_to=alice.id, project_id=p4.id),
        models.Task(title="App Store submission", description="Prepare screenshots and metadata.", status=models.TaskStatusEnum.todo, due_date=today + timedelta(days=15), assigned_to=None, project_id=p4.id),
        models.Task(title="Fix navigation crash", description="Resolve deep link crash on Android.", status=models.TaskStatusEnum.done, due_date=today - timedelta(days=2), assigned_to=bob.id, project_id=p4.id),
    ]
    db.add_all(tasks)
    db.commit()

    print("[SEED] Done: 4 users, 4 projects, 24 tasks")
    print("   Admin:   admin@test.com / admin123")
    print("   Members: alice@test.com, bob@test.com, carol@test.com / user123")
