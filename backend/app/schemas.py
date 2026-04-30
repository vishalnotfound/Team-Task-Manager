from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date
from .models import RoleEnum, TaskStatusEnum

# Auth
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.member

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None
    role: Optional[str] = None

# User
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum

    class Config:
        from_attributes = True

# Project Member Schemas
class ProjectMemberCreate(BaseModel):
    user_id: int

class ProjectMemberResponse(BaseModel):
    id: int
    user: UserResponse

    class Config:
        from_attributes = True

# Project Schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    owner_id: int
    members: List[ProjectMemberResponse] = []

    class Config:
        from_attributes = True

class ProjectListResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    owner_id: int

    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatusEnum = TaskStatusEnum.todo
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None
    project_id: int

class TaskUpdateAdmin(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatusEnum] = None
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None

class TaskUpdateMember(BaseModel):
    status: TaskStatusEnum

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatusEnum
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None
    project_id: int
    assignee: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# Dashboard
class AdminDashboard(BaseModel):
    total_projects: int
    total_tasks: int
    tasks_by_status: dict
    overdue_tasks: int

class MemberDashboard(BaseModel):
    my_tasks: int
    overdue_tasks: int
