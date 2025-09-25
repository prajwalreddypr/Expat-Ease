# Expat Ease 🚀

> **A comprehensive platform helping immigrants and expats settle seamlessly in new cities**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Expat Ease is a full-stack web application designed to simplify the immigration and settlement process for expats and immigrants. The platform provides a comprehensive checklist system, document management, local service discovery, and community features to help users navigate their new environment effectively.

### Key Benefits

- **Personalized Checklists**: Country-specific settlement tasks with progress tracking
- **Document Management**: Secure upload and organization of required documents
- **Local Services**: Directory of government offices and essential services
- **Community Support**: Connect with fellow expats in your area
- **Progress Tracking**: Visual progress indicators and completion statistics

## ✨ Features

### 🔐 Authentication & User Management

- Secure JWT-based authentication
- User registration and profile management
- Country selection and personalization
- Role-based access control

### 📝 Settlement Checklist

- Country-specific task lists
- Priority-based task organization
- Progress tracking with visual indicators
- Estimated completion times
- Task dependencies and prerequisites

### 📄 Document Management

- Secure file upload and storage
- Document categorization and tagging
- Deadline tracking and reminders
- Document status management

### 🏛️ Local Services

- Government office directory
- Essential service locator
- Contact information and hours
- Location-based recommendations

### 💬 Community Features

- Expat community forums
- Local event listings
- Peer-to-peer support
- Success stories and tips

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • User Data     │
│ • Authentication│    │ • JWT Auth      │    │ • Tasks         │
│ • Task Mgmt     │    │ • File Upload   │    │ • Documents     │
│ • Document Mgmt │    │ • CRUD Ops      │    │ • Settings      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### System Components

- **Frontend**: React 19 with TypeScript, Tailwind CSS for styling
- **Backend**: FastAPI with Python, SQLModel for ORM
- **Database**: SQLite for development, easily scalable to PostgreSQL
- **Authentication**: JWT tokens with secure password hashing
- **File Storage**: Local file system with static file serving

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server

### Backend

- **FastAPI** - Modern, fast web framework for APIs
- **SQLModel** - SQL databases with Python type hints
- **SQLite** - Lightweight database engine
- **Pydantic** - Data validation using Python type annotations
- **Passlib** - Password hashing library
- **Python-JOSE** - JWT token handling

### Development Tools

- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Uvicorn** - ASGI server for FastAPI

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/expat-ease.git
   cd expat-ease
   ```

2. **Backend Setup**

   ```bash
   cd expat-ease-backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. **Frontend Setup**

   ```bash
   cd ../expat-ease-frontend
   npm install
   ```

4. **Environment Configuration**

   ```bash
   # Backend
   cd expat-ease-backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the Application**

   **Backend (Terminal 1):**

   ```bash
   cd expat-ease-backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   **Frontend (Terminal 2):**

   ```bash
   cd expat-ease-frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: <http://localhost:5173>
   - Backend API: <http://localhost:8000>
   - API Documentation: <http://localhost:8000/docs>

## 📁 Project Structure

```
expat-ease/
├── expat-ease-backend/          # FastAPI Backend
│   ├── app/
│   │   ├── api/                 # API routes and endpoints
│   │   │   └── api_v1/
│   │   │       ├── api.py       # Main API router
│   │   │       └── endpoints/   # Individual endpoint modules
│   │   ├── core/                # Core functionality
│   │   │   ├── config.py        # Configuration settings
│   │   │   ├── deps.py          # Dependency injection
│   │   │   ├── security.py      # Security utilities
│   │   │   └── storage.py       # File storage handling
│   │   ├── crud/                # Database operations
│   │   ├── db/                  # Database configuration
│   │   ├── models/              # SQLModel data models
│   │   └── main.py              # FastAPI application entry point
│   ├── uploads/                 # File upload directory
│   ├── requirements.txt         # Python dependencies
│   └── README.md               # Backend documentation
├── expat-ease-frontend/         # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── contexts/            # React context providers
│   │   ├── pages/               # Page components
│   │   ├── App.tsx              # Main App component
│   │   └── main.tsx             # Application entry point
│   ├── public/                  # Static assets
│   ├── package.json             # Node.js dependencies
│   └── README.md               # Frontend documentation
└── README.md                   # This file
```

## 📚 API Documentation

The backend provides a comprehensive REST API with the following endpoints:

### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile

### Tasks

- `GET /api/v1/tasks/` - Get user tasks
- `POST /api/v1/tasks/` - Create new task
- `PUT /api/v1/tasks/{task_id}` - Update task
- `DELETE /api/v1/tasks/{task_id}` - Delete task

### Documents

- `GET /api/v1/documents/` - Get user documents
- `POST /api/v1/documents/upload` - Upload document
- `DELETE /api/v1/documents/{doc_id}` - Delete document

### Users

- `GET /api/v1/users/me` - Get user profile
- `PUT /api/v1/users/me` - Update user profile

**Interactive API Documentation**: Visit <http://localhost:8000/docs> for Swagger UI documentation.

## 🔧 Development

### Backend Development

```bash
cd expat-ease-backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
python -m uvicorn app.main:app --reload

# Run tests (when available)
pytest
```

### Frontend Development

```bash
cd expat-ease-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Database Management

```bash
cd expat-ease-backend

# Initialize database
python -c "from app.db.init_db import create_db_and_tables; create_db_and_tables()"

# Check database status
python check_db.py
```

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup**

   ```bash
   export DATABASE_URL="postgresql://user:password@localhost/expat_ease"
   export SECRET_KEY="your-secret-key"
   export ENVIRONMENT="production"
   ```

2. **Production Server**

   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Frontend Deployment

```bash
cd expat-ease-frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Docker Deployment (Optional)

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**

   ```bash
   git commit -m 'Add amazing feature'
   ```

4. **Push to the branch**

   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI team for the excellent web framework
- React team for the powerful frontend library
- All contributors who help make this project better

## 📞 Support

- **Documentation**: Check the individual README files in each directory
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join our community discussions for questions and ideas

---

**Made with ❤️ for the global expat community**
