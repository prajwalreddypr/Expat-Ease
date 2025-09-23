"""
CRUD operations for User model.
"""
from typing import Optional

from sqlmodel import Session, select

from app.core.security import hash_password
from app.models.user import User, UserCreate, UserUpdate


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """
    Get a user by email address.
    
    Args:
        session: Database session
        email: Email address to search for
        
    Returns:
        Optional[User]: User if found, None otherwise
    """
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def create_user(session: Session, user_in: UserCreate) -> User:
    """
    Create a new user.
    
    Args:
        session: Database session
        user_in: User creation data
        
    Returns:
        User: The created user
        
    Raises:
        ValueError: If email already exists
    """
    # Check if user with email already exists
    existing_user = get_user_by_email(session, user_in.email)
    if existing_user:
        raise ValueError("Email already registered")
    
    # Hash the password
    hashed_password = hash_password(user_in.password)
    
    # Create user object
    user_data = user_in.model_dump(exclude={"password"})
    user = User(
        **user_data,
        hashed_password=hashed_password
    )
    
    # Add to database
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user


def get_user(session: Session, user_id: int) -> Optional[User]:
    """
    Get a user by ID.
    
    Args:
        session: Database session
        user_id: User ID to search for
        
    Returns:
        Optional[User]: User if found, None otherwise
    """
    statement = select(User).where(User.id == user_id)
    return session.exec(statement).first()


def update_user(session: Session, user_id: int, user_in: UserUpdate) -> Optional[User]:
    """
    Update a user.
    
    Args:
        session: Database session
        user_id: ID of user to update
        user_in: User update data
        
    Returns:
        Optional[User]: Updated user if found, None otherwise
    """
    user = get_user(session, user_id)
    if not user:
        return None
    
    # Get update data, excluding None values
    update_data = user_in.model_dump(exclude_unset=True)
    
    # Hash password if provided
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))
    
    # Update user fields
    for field, value in update_data.items():
        setattr(user, field, value)
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user
