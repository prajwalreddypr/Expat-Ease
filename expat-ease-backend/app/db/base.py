"""
Base database module.
Import all models here so they are registered with SQLModel.
This is required for create_db_and_tables() to work properly.
"""

# Import all models here so they are registered with SQLModel
from app.models.user import User  # noqa: F401
from app.models.task import Task  # noqa: F401
from app.models.document import Document  # noqa: F401

# TODO: Import additional models here as you create them
# from app.models.city import City  # noqa: F401
