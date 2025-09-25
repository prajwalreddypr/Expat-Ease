# Expat Ease Backend 🚀

> **FastAPI-powered backend for comprehensive expat settlement management**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)](https://pydantic.dev/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

The Expat Ease Backend is a robust, scalable REST API built with FastAPI that powers the expat settlement platform. It provides secure authentication, task management, document handling, and user profile management for immigrants settling in new countries.

### Key Capabilities

- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Task Management**: Country-specific settlement checklists with progress tracking
- **Document Storage**: Secure file upload and management system
- **User Profiles**: Comprehensive user data management
- **RESTful API**: Well-documented, standards-compliant endpoints
- **Database ORM**: Type-safe database operations with SQLModel

## ✨ Features

### 🔐 Authentication & Security

- JWT token-based authentication
- Secure password hashing with bcrypt
- Role-based access control
- CORS configuration for frontend integration
- Input validation with Pydantic models

### 📊 Data Management

- SQLModel ORM with SQLite database
- Automatic database initialization
- Migration-ready schema design
- Type-safe data models
- Relationship management between entities

### 📁 File Management

- Secure file upload handling
- Static file serving
- File type validation
- Organized upload directory structure

### 🛡️ API Features

- Auto-generated OpenAPI documentation
- Request/response validation
- Error handling and logging
- Health check endpoints
- CORS middleware

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Expat Ease Backend                      │
├─────────────────────────────────────────────────────────────┤
│  FastAPI Application                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   API       │ │   Core      │ │   Models    │          │
│  │   Routes    │ │   Config    │ │   Database  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Middleware Layer                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   CORS      │ │   Auth      │ │   Static    │          │
│  │   Middleware│ │   Middleware│ │   Files     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Database Layer                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           SQLite Database with SQLModel ORM             ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      ││
│  │  │  Users  │ │  Tasks  │ │Documents│ │Settings │      ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 🔗 API Endpoints

### Authentication

```
POST   /api/v1/auth/register     # User registration
POST   /api/v1/auth/login        # User login
GET    /api/v1/auth/me           # Get current user
```

### Tasks Management

```
GET    /api/v1/tasks/            # Get user tasks
POST   /api/v1/tasks/            # Create new task
PUT    /api/v1/tasks/{task_id}   # Update task
DELETE /api/v1/tasks/{task_id}   # Delete task
```

### Documents

```
GET    /api/v1/documents/        # Get user documents
POST   /api/v1/documents/upload  # Upload document
DELETE /api/v1/documents/{doc_id} # Delete document
```

### Users

```
GET    /api/v1/users/me          # Get user profile
PUT    /api/v1/users/me          # Update user profile
```

### System

```
GET    /health                   # Health check
GET    /test-cors               # CORS test endpoint
```

## 🗄️ Database Models

### User Model

```python
class User(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    full_name: Optional[str]
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime
    country: Optional[str]
    country_selected: bool = Field(default=False)
```

### Task Model

```python
class Task(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    country: str
    user_id: int = Field(foreign_key="users.id")
    order_index: int
    is_required: bool
    estimated_days: Optional[int]
    created_at: datetime
    updated_at: datetime
```

## 🚀 Setup & Installation

### Prerequisites

- **Python 3.9+**
- **pip** (Python package manager)
- **Git**

### 1. Clone and Navigate

```bash
git clone https://github.com/yourusername/expat-ease.git
cd expat-ease/expat-ease-backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# SECRET_KEY=your-secret-key-here
# DATABASE_URL=sqlite:///./dev.db
# ENVIRONMENT=development
```

### 5. Initialize Database

```bash
python -c "from app.db.init_db import create_db_and_tables; create_db_and_tables()"
```

### 6. Run the Application

```bash
# Development server with auto-reload
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 7. Verify Installation

- **API**: <http://localhost:8000>
- **Interactive Docs**: <http://localhost:8000/docs>
- **Health Check**: <http://localhost:8000/health>

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SECRET_KEY` | JWT signing key | - | ✅ |
| `DATABASE_URL` | Database connection string | `sqlite:///./dev.db` | ❌ |
| `ENVIRONMENT` | Environment (dev/prod) | `development` | ❌ |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` | ❌ |
| `UPLOAD_DIR` | File upload directory | `uploads` | ❌ |

### Database Configuration

The application uses SQLModel with SQLite by default, but can be easily configured for PostgreSQL or MySQL:

```python
# SQLite (Default)
DATABASE_URL = "sqlite:///./dev.db"

# PostgreSQL
DATABASE_URL = "postgresql://user:password@localhost/expat_ease"

# MySQL
DATABASE_URL = "mysql://user:password@localhost/expat_ease"
```

## 🔧 Development

### Project Structure

```
expat-ease-backend/
├── app/
│   ├── api/                    # API routes and endpoints
│   │   └── api_v1/
│   │       ├── api.py          # Main API router
│   │       └── endpoints/      # Individual endpoint modules
│   ├── core/                   # Core functionality
│   │   ├── config.py           # Configuration settings
│   │   ├── deps.py             # Dependency injection
│   │   ├── security.py         # Security utilities
│   │   └── storage.py          # File storage handling
│   ├── crud/                   # Database operations
│   │   ├── crud_user.py        # User CRUD operations
│   │   └── crud_task.py        # Task CRUD operations
│   ├── db/                     # Database configuration
│   │   ├── base.py             # Base model definitions
│   │   ├── init_db.py          # Database initialization
│   │   └── session.py          # Database session management
│   ├── models/                 # SQLModel data models
│   │   ├── user.py             # User model and schemas
│   │   ├── task.py             # Task model and schemas
│   │   ├── document.py         # Document model and schemas
│   │   └── auth.py             # Authentication models
│   └── main.py                 # FastAPI application entry point
├── uploads/                    # File upload directory
├── requirements.txt            # Python dependencies
├── check_db.py                # Database health check script
└── README.md                  # This file
```

### Development Commands

```bash
# Run with auto-reload for development
python -m uvicorn app.main:app --reload

# Run with specific host and port
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Check database status
python check_db.py

# Install development dependencies
pip install -r requirements.txt

# Format code (if using black)
black app/

# Lint code (if using flake8)
flake8 app/
```

### Adding New Features

1. **Create Model** (if needed):

   ```python
   # app/models/new_feature.py
   class NewFeature(SQLModel, table=True):
       id: Optional[int] = Field(primary_key=True)
       # ... other fields
   ```

2. **Create CRUD Operations**:

   ```python
   # app/crud/crud_new_feature.py
   def create_new_feature(db: Session, new_feature: NewFeatureCreate):
       # ... implementation
   ```

3. **Create API Endpoints**:

   ```python
   # app/api/api_v1/endpoints/new_feature.py
   @router.post("/new-features/", response_model=NewFeatureRead)
   def create_new_feature(new_feature: NewFeatureCreate, db: Session = Depends(get_db)):
       # ... implementation
   ```

4. **Register Routes**:

   ```python
   # app/api/api_v1/api.py
   from app.api.api_v1.endpoints import new_feature
   api_router.include_router(new_feature.router, prefix="/new-features", tags=["new-features"])
   ```

## 🧪 Testing

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

### Test Structure

```
tests/
├── conftest.py              # Test configuration and fixtures
├── test_auth.py             # Authentication tests
├── test_tasks.py            # Task management tests
├── test_users.py            # User management tests
└── test_documents.py        # Document handling tests
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**:

   ```bash
   export SECRET_KEY="your-production-secret-key"
   export DATABASE_URL="postgresql://user:password@localhost/expat_ease"
   export ENVIRONMENT="production"
   ```

2. **Install Production Dependencies**:

   ```bash
   pip install gunicorn
   ```

3. **Run with Gunicorn**:

   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=your-secret-key
      - DATABASE_URL=sqlite:///./dev.db
    volumes:
      - ./uploads:/app/uploads
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
4. **Run tests**:

   ```bash
   pytest
   ```

5. **Commit your changes**:

   ```bash
   git commit -m 'Add amazing feature'
   ```

6. **Push to the branch**:

   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**

### Code Standards

- Follow **PEP 8** for Python code style
- Use **type hints** for all function parameters and return values
- Write **docstrings** for all functions and classes
- Include **tests** for new features
- Update **documentation** as needed

### Commit Message Format

```
type(scope): description

Examples:
feat(auth): add JWT token refresh endpoint
fix(docs): correct API documentation examples
docs(readme): update installation instructions
test(users): add user creation tests
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)
- [OpenAPI Specification](https://swagger.io/specification/)

## 📞 Support

- **Issues**: Report bugs via [GitHub Issues](https://github.com/yourusername/expat-ease/issues)
- **Discussions**: Join community discussions
- **Documentation**: Check the main project README

---

**Built with ❤️ using FastAPI and modern Python practices**
