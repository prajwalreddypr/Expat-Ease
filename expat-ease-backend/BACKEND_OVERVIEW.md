# Backend Overview - Expat Ease API

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Backend Modules](#backend-modules)
- [FastAPI Implementation Details](#fastapi-implementation-details)
- [Key Features & Patterns](#key-features--patterns)
- [Interview Preparation Q&A](#interview-preparation-qa)

---

## 🏗️ Architecture Overview

The backend is built using **FastAPI** with a modular, layered architecture:

```
expat-ease-backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── api/                 # API routes layer
│   │   └── api_v1/
│   │       ├── api.py       # Main router aggregator
│   │       └── endpoints/   # Individual endpoint modules
│   ├── core/                # Core utilities & configuration
│   ├── crud/                # Database operations layer
│   ├── db/                  # Database configuration
│   ├── models/              # SQLModel data models
│   └── services/            # Business logic services
```

---

## 📦 Backend Modules

### 1. **Main Application (`app/main.py`)**

- **Purpose**: FastAPI application entry point
- **Key Features**:
  - FastAPI app initialization with metadata (title, description, version)
  - Lifespan context manager for startup/shutdown events
  - CORS middleware configuration
  - Request logging middleware
  - Health check endpoints (`/health`, `/test-cors`)
  - API router inclusion at `/api/v1` prefix

**FastAPI Features Used**:

- `FastAPI()` constructor with lifespan events
- `CORSMiddleware` for cross-origin requests
- Custom `BaseHTTPMiddleware` for request logging
- Router mounting with `app.include_router()`

---

### 2. **API Layer (`app/api/api_v1/`)**

#### **Main Router (`api.py`)**

- Aggregates all endpoint routers
- Uses FastAPI's `APIRouter` for modular routing
- Organizes endpoints by feature with tags

#### **Endpoint Modules (`endpoints/`)**

**a) `auth.py`** - Authentication

- `POST /api/v1/auth/login` - User login with JWT token generation
- `GET /api/v1/auth/me` - Get current user info

**b) `auth_reset.py`** - Password Reset

- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

**c) `users.py`** - User Management

- `GET /api/v1/users/me` - Get user profile
- `PUT /api/v1/users/me` - Update user profile
- `POST /api/v1/users/register` - User registration

**d) `tasks.py`** - Task Management

- `GET /api/v1/tasks/` - Get user tasks (with country filter)
- `POST /api/v1/tasks/` - Create new task
- `PUT /api/v1/tasks/{task_id}` - Update task
- `DELETE /api/v1/tasks/{task_id}` - Delete task
- `POST /api/v1/tasks/initialize` - Initialize default tasks for country

**e) `documents.py`** - Document Management

- `GET /api/v1/documents/` - Get user documents
- `POST /api/v1/documents/upload` - Upload document (multipart/form-data)
- `DELETE /api/v1/documents/{doc_id}` - Delete document

**f) `settlement_steps.py`** - Settlement Steps

- `GET /api/v1/settlement-steps/` - Get settlement steps by country

**g) `forum.py`** - Community Forum

- `GET /api/v1/forum/questions` - Get forum questions
- `POST /api/v1/forum/questions` - Create question
- `GET /api/v1/forum/questions/{question_id}` - Get question details
- `POST /api/v1/forum/questions/{question_id}/answers` - Post answer
- `PUT /api/v1/forum/questions/{question_id}/upvote` - Upvote question

---

### 3. **Core Module (`app/core/`)**

#### **`config.py`** - Configuration Management

- Uses `pydantic-settings` for environment variable management
- Settings class with defaults and validation
- Database URL, JWT secret, CORS origins, Cloudinary config, SMTP settings

#### **`security.py`** - Security Utilities

- **Password Hashing**: `hash_password()` using bcrypt (Passlib)
- **Password Verification**: `verify_password()`
- **JWT Token Creation**: `create_access_token()` with expiration
- **JWT Token Verification**: `verify_token()` using python-jose

#### **`deps.py`** - Dependency Injection

- **`get_session()`**: Database session dependency
- **`get_current_user()`**: JWT authentication dependency
  - Extracts Bearer token from `Authorization` header
  - Verifies token and extracts user ID
  - Fetches user from database
- **`get_current_active_user()`**: Additional check for active users

**FastAPI Dependency Injection Pattern**:

```python
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    # Authentication logic
```

#### **`storage.py`** - File Storage

- Cloudinary integration for file uploads
- `save_upload_file()` - Async file upload handler
- File validation and size checks

#### **`security_middleware.py`** - Security Middleware

- Rate limiting
- Security headers
- Request validation

#### **`audit_logger.py`** - Audit Logging

- Security event logging
- User action tracking

---

### 4. **Database Layer (`app/db/`)**

#### **`session.py`** - Database Session

- SQLModel engine creation
- Session factory using `get_session()` generator
- Supports SQLite (dev) and PostgreSQL (production)

#### **`init_db.py`** - Database Initialization

- `create_db_and_tables()` - Creates tables on startup
- Uses SQLModel metadata

#### **`base.py`** - Base Database Configuration

- Base model definitions
- Common database utilities

---

### 5. **Models (`app/models/`)**

SQLModel models (combines SQLAlchemy ORM + Pydantic validation):

- **`user.py`**: User model with authentication fields
- **`task.py`**: Task model with status, priority, country
- **`document.py`**: Document model with file metadata
- **`forum.py`**: Forum models (Question, Answer, Upvote)
- **`settlement_step.py`**: Settlement step templates
- **`auth.py`**: Request/Response models (LoginRequest, Token)
- **`password_reset_token.py`**: Password reset token model

**FastAPI Integration**:

- Models used as `response_model` in endpoints
- Automatic request validation via Pydantic
- Automatic OpenAPI schema generation

---

### 6. **CRUD Layer (`app/crud/`)**

Database operation modules:

- **`crud_user.py`**: User CRUD operations
  - `get_user()`, `get_user_by_email()`, `create_user()`, `update_user()`

- **`crud_task.py`**: Task CRUD operations
  - `get_tasks_for_user()`, `create_task()`, `update_task()`, `delete_task()`

- **`crud_password_reset.py`**: Password reset token management

**Pattern**: Separates database logic from API logic (separation of concerns)

---

## 🚀 FastAPI Implementation Details

### **1. Application Initialization**

```python
app = FastAPI(
    title="Expat Ease API",
    description="Backend API for Expat Ease",
    version="1.0.0",
    lifespan=lifespan,  # Startup/shutdown events
)
```

### **2. Middleware Stack**

**Order matters!** Middleware executes in reverse order of addition:

1. **Request Logging Middleware** (added first, executes last)
   - Logs incoming requests and headers
   - Custom `BaseHTTPMiddleware` implementation

2. **CORS Middleware** (added second, executes first)
   - Handles preflight OPTIONS requests
   - Configures allowed origins, methods, headers
   - Enables credentials for authenticated requests

### **3. Router Organization**

**Hierarchical Routing**:

```python
# Main router in api.py
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# In main.py
app.include_router(api_router, prefix="/api/v1")
# Final URL: /api/v1/auth/login
```

### **4. Dependency Injection System**

FastAPI's dependency injection is used extensively:

**Database Session**:

```python
def get_tasks(session: Session = Depends(get_session)):
    # Session automatically provided and closed
```

**Authentication**:

```python
def get_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # User automatically authenticated from JWT
```

**Nested Dependencies**:

```python
def get_current_active_user(
    current_user: User = Depends(get_current_user)  # Depends on another dependency
) -> User:
    # Additional validation
```

### **5. Request/Response Models**

**Pydantic Models for Validation**:

```python
@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, ...):
    # login_data automatically validated
    # Response automatically serialized to Token model
```

### **6. File Upload Handling**

**Multipart Form Data**:

```python
@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    custom_name: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user)
):
    # Async file handling with aiofiles
```

### **7. Error Handling**

**HTTP Exceptions**:

```python
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid credentials",
    headers={"WWW-Authenticate": "Bearer"}
)
```

### **8. Async Support**

- Uses `async def` for I/O-bound operations (file uploads)
- Uses `aiofiles` for async file operations
- Database operations use synchronous SQLModel (can be upgraded to async)

---

## 🔑 Key Features & Patterns

### **1. JWT Authentication Flow**

1. User logs in → `POST /api/v1/auth/login`
2. Backend validates credentials → Returns JWT token
3. Frontend stores token → Sends in `Authorization: Bearer <token>` header
4. Protected endpoints use `Depends(get_current_user)` → Validates token → Returns user

### **2. Database Session Management**

- Generator-based session dependency
- Automatic session cleanup after request
- Thread-safe SQLite connection handling

### **3. Configuration Management**

- Environment variables via `pydantic-settings`
- `.env` file support
- Type-safe settings with validation

### **4. File Storage Strategy**

- **Development**: Local file system (`uploads/` directory)
- **Production**: Cloudinary cloud storage
- Async file handling for better performance

### **5. CORS Configuration**

- Dynamic origin resolution from environment
- Supports multiple frontend URLs
- Production origins hardcoded as fallback
- Credentials enabled for authenticated requests

### **6. API Versioning**

- All routes under `/api/v1/` prefix
- Easy to add `/api/v2/` in future

### **7. OpenAPI Documentation**

- Automatic schema generation
- Interactive docs at `/docs` (Swagger UI)
- Alternative docs at `/redoc`

---

## 📝 Interview Preparation Q&A

### **Q1: Why did you choose FastAPI over Flask/Django?**

**Answer**:

- **Performance**: FastAPI is one of the fastest Python frameworks (comparable to Node.js/Go)
- **Type Safety**: Built on Pydantic for automatic request/response validation
- **Async Support**: Native async/await support for I/O-bound operations
- **Auto Documentation**: Automatic OpenAPI/Swagger docs generation
- **Modern Python**: Uses Python type hints, making code more maintainable
- **Dependency Injection**: Built-in DI system for clean architecture

### **Q2: How does your authentication system work?**

**Answer**:

- **JWT-based authentication** using `python-jose` library
- **Password hashing** with bcrypt via Passlib
- **Token generation**: Creates JWT with user ID and email, 24-hour expiration
- **Token validation**: Middleware extracts Bearer token, verifies signature, fetches user from DB
- **Dependency injection**: `get_current_user()` dependency automatically validates token on protected routes
- **Security**: Passwords never stored in plain text, tokens expire, secure password truncation to prevent bcrypt errors

### **Q3: Explain your project structure and why you organized it this way?**

**Answer**:

- **Layered Architecture**: Separation of concerns
  - `api/` - HTTP layer (routes, request/response handling)
  - `crud/` - Database operations (business logic)
  - `models/` - Data models (SQLModel + Pydantic)
  - `core/` - Shared utilities (config, security, dependencies)
  - `db/` - Database configuration
- **Benefits**:
  - Easy to test (mock dependencies)
  - Easy to maintain (clear responsibilities)
  - Easy to scale (add new features without touching existing code)
  - Follows FastAPI best practices

### **Q4: How do you handle file uploads?**

**Answer**:

- **FastAPI's `UploadFile`** for multipart form data
- **Async file handling** with `aiofiles` for non-blocking I/O
- **File validation**: Extension check, size limit (10MB)
- **Storage**: Cloudinary for production (cloud storage), local filesystem for dev
- **Security**: Unique filenames (UUID), user-scoped storage, content type validation

### **Q5: How does dependency injection work in your project?**

**Answer**:

- FastAPI's `Depends()` function creates dependencies
- **Database session**: `get_session()` generator provides DB connection, auto-closes after request
- **Authentication**: `get_current_user()` extracts JWT, validates, returns user object
- **Nested dependencies**: `get_current_active_user()` depends on `get_current_user()`
- **Benefits**: Reusable, testable, automatic resource cleanup

### **Q6: How do you handle CORS in your application?**

**Answer**:

- **CORSMiddleware** configured with dynamic origin resolution
- **Environment-based**: Reads `FRONTEND_URL` or `FRONTEND_URLS` from config
- **Fallback origins**: Production URLs hardcoded as safety net
- **Credentials enabled**: Allows cookies/auth headers for authenticated requests
- **Methods/Headers**: Allows GET, POST, PUT, DELETE, PATCH, OPTIONS with all headers

### **Q7: What database are you using and why?**

**Answer**:

- **SQLite for development** (easy setup, no server needed)
- **PostgreSQL for production** (via `DATABASE_URL` environment variable)
- **SQLModel ORM**: Combines SQLAlchemy + Pydantic
  - Type-safe models
  - Automatic validation
  - Easy migration path
- **Session management**: Generator-based dependency for automatic cleanup

### **Q8: How do you ensure security in your API?**

**Answer**:

- **Password security**: bcrypt hashing, password truncation to prevent errors
- **JWT tokens**: Signed tokens with expiration (24 hours)
- **HTTPS**: Enforced in production (via `ENABLE_HTTPS` setting)
- **Rate limiting**: Configurable rate limits (via middleware)
- **Input validation**: Pydantic models validate all request data
- **File upload security**: File type validation, size limits, unique filenames
- **CORS**: Restricted origins, no wildcard in production
- **Audit logging**: Security events logged (optional)

### **Q9: How would you scale this application?**

**Answer**:

- **Horizontal scaling**: Stateless API (JWT tokens), can run multiple instances
- **Database**: Migrate to PostgreSQL, add connection pooling, read replicas
- **Caching**: Add Redis for session caching, frequently accessed data
- **Async database**: Upgrade to async SQLAlchemy for better concurrency
- **Load balancing**: Use nginx/HAProxy in front of multiple FastAPI instances
- **CDN**: Use Cloudinary CDN for file serving
- **Monitoring**: Add logging, metrics (Prometheus), APM tools

### **Q10: What are the key FastAPI features you're using?**

**Answer**:

1. **Automatic API documentation** (OpenAPI/Swagger)
2. **Type validation** with Pydantic models
3. **Dependency injection** for clean architecture
4. **Async support** for file uploads
5. **Router organization** for modular endpoints
6. **Middleware** for CORS and logging
7. **Lifespan events** for startup/shutdown logic
8. **Response models** for automatic serialization
9. **Status codes** and HTTP exceptions for error handling
10. **Path/Query parameters** with automatic validation

---

## 🛠️ Tech Stack Summary

- **Framework**: FastAPI 0.104+
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT (python-jose) + bcrypt (passlib)
- **File Storage**: Cloudinary
- **Validation**: Pydantic
- **Server**: Uvicorn (ASGI)
- **Async Files**: aiofiles

---

## 📚 Additional Notes

- **Development**: Run with `uvicorn app.main:app --reload`
- **Production**: Use gunicorn with uvicorn workers
- **Testing**: Can use FastAPI's `TestClient` for integration tests
- **Documentation**: Auto-generated at `/docs` and `/redoc`
- **Environment**: Configuration via `.env` file or environment variables

---

**Good luck with your interview! 🚀**
