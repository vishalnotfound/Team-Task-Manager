from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, database, auth

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(project_id: Optional[int] = None, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    query = db.query(models.Task)
    
    if current_user.role == models.RoleEnum.admin:
        if project_id:
            query = query.filter(models.Task.project_id == project_id)
    else:
        # Member sees all tasks from projects they belong to
        member_project_ids = [
            pm.project_id for pm in
            db.query(models.ProjectMember).filter(models.ProjectMember.user_id == current_user.id).all()
        ]
        query = query.filter(models.Task.project_id.in_(member_project_ids))
        if project_id:
            query = query.filter(models.Task.project_id == project_id)
            
    return query.all()

@router.post("/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(database.get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    # Validate project
    project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Validate assigned_to user is in project
    if task.assigned_to:
        member = db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == task.project_id,
            models.ProjectMember.user_id == task.assigned_to
        ).first()
        if not member:
            raise HTTPException(status_code=400, detail="Assigned user is not a member of the project")

    new_task = models.Task(
        title=task.title,
        description=task.description,
        status=task.status,
        due_date=task.due_date,
        assigned_to=task.assigned_to,
        project_id=task.project_id,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.patch("/{id}", response_model=schemas.TaskResponse)
def update_task(id: int, task_update: dict = Body(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role == models.RoleEnum.admin:
        # Admin can update anything — only apply fields that were sent
        allowed_fields = {"title", "description", "status", "due_date", "assigned_to"}
        update_data = {k: v for k, v in task_update.items() if k in allowed_fields}
        
        if "assigned_to" in update_data and update_data["assigned_to"]:
            member = db.query(models.ProjectMember).filter(
                models.ProjectMember.project_id == task.project_id,
                models.ProjectMember.user_id == update_data["assigned_to"]
            ).first()
            if not member:
                raise HTTPException(status_code=400, detail="Assigned user is not a member of the project")
    else:
        # Member can only update status of tasks in their projects
        is_member = db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == task.project_id,
            models.ProjectMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")
        
        if "status" not in task_update:
            raise HTTPException(status_code=400, detail="Members can only update task status")
        update_data = {"status": task_update["status"]}

    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(id: int, db: Session = Depends(database.get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    task = db.query(models.Task).filter(models.Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
