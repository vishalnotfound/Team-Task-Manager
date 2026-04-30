from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("/", response_model=List[schemas.ProjectListResponse])
def get_projects(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role == models.RoleEnum.admin:
        projects = db.query(models.Project).all()
    else:
        # Member only sees projects they belong to
        projects = db.query(models.Project).join(models.ProjectMember).filter(models.ProjectMember.user_id == current_user.id).all()
    return projects

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    new_project = models.Project(
        name=project.name,
        description=project.description,
        owner_id=current_admin.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Add owner as a member automatically
    owner_member = models.ProjectMember(user_id=current_admin.id, project_id=new_project.id)
    db.add(owner_member)
    db.commit()
    
    return new_project

# Members routes BEFORE the /{id} delete to avoid path conflicts
@router.get("/{id}/members", response_model=List[schemas.ProjectMemberResponse])
def get_project_members(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    members = db.query(models.ProjectMember).filter(models.ProjectMember.project_id == id).all()
    return members

@router.post("/{id}/members", response_model=schemas.ProjectMemberResponse)
def add_member(id: int, member: schemas.ProjectMemberCreate, db: Session = Depends(database.get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    project = db.query(models.Project).filter(models.Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    user = db.query(models.User).filter(models.User.id == member.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    existing_member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == id,
        models.ProjectMember.user_id == member.user_id
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member of this project")
        
    new_member = models.ProjectMember(user_id=member.user_id, project_id=id)
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member

@router.delete("/{id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(id: int, user_id: int, db: Session = Depends(database.get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    project = db.query(models.Project).filter(models.Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.owner_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot remove the owner from the project")
        
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == id,
        models.ProjectMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in project")
        
    db.delete(member)
    db.commit()

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(id: int, db: Session = Depends(database.get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    project = db.query(models.Project).filter(models.Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
