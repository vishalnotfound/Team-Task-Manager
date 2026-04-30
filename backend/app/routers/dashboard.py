from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from .. import models, database, auth

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    today = date.today()
    
    if current_user.role == models.RoleEnum.admin:
        total_projects = db.query(models.Project).count()
        total_tasks = db.query(models.Task).count()
        
        status_counts = db.query(models.Task.status, func.count(models.Task.id)).group_by(models.Task.status).all()
        tasks_by_status = {status.value: count for status, count in status_counts}
        
        overdue_tasks = db.query(models.Task).filter(
            models.Task.due_date < today,
            models.Task.status != models.TaskStatusEnum.done
        ).count()
        
        return {
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "tasks_by_status": tasks_by_status,
            "overdue_tasks": overdue_tasks
        }
    else:
        # Member dashboard — stats from projects they belong to
        member_project_ids = [
            pm.project_id for pm in
            db.query(models.ProjectMember).filter(models.ProjectMember.user_id == current_user.id).all()
        ]
        
        total_projects = len(member_project_ids)
        total_tasks = db.query(models.Task).filter(models.Task.project_id.in_(member_project_ids)).count()
        
        status_counts = db.query(models.Task.status, func.count(models.Task.id)).filter(
            models.Task.project_id.in_(member_project_ids)
        ).group_by(models.Task.status).all()
        tasks_by_status = {status.value: count for status, count in status_counts}
        
        overdue_tasks = db.query(models.Task).filter(
            models.Task.project_id.in_(member_project_ids),
            models.Task.due_date < today,
            models.Task.status != models.TaskStatusEnum.done
        ).count()
        
        return {
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "tasks_by_status": tasks_by_status,
            "overdue_tasks": overdue_tasks
        }
