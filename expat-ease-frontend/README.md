# Expat Ease Frontend 🚀

> **Modern React frontend for comprehensive expat settlement management**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Component Structure](#component-structure)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [Styling](#styling)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Build & Deployment](#build--deployment)
- [Contributing](#contributing)

## 🎯 Overview

The Expat Ease Frontend is a modern, responsive web application built with React 19 and TypeScript. It provides an intuitive user interface for immigrants and expats to manage their settlement process, track tasks, organize documents, and connect with their community.

### Key Features

- **Modern React 19**: Latest React features with improved performance
- **TypeScript**: Full type safety and enhanced developer experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component-Based Architecture**: Reusable and maintainable UI components
- **Real-time Updates**: Dynamic data synchronization with backend
- **Accessibility**: WCAG compliant design patterns

## ✨ Features

### 🔐 Authentication & User Management

- Secure login and registration forms
- JWT token-based authentication
- Protected routes and user session management
- User profile management with country selection

### 📊 Dashboard & Navigation

- Personalized dashboard with user-specific content
- Intuitive navigation with glass-morphism design
- Progress tracking and completion statistics
- Quick access to all major features

### 📝 Task Management

- Interactive settlement checklists
- Task status tracking (pending, in-progress, completed)
- Priority-based task organization
- Progress visualization with completion percentages

### 📄 Document Management

- Secure document upload and organization
- Document categorization and tagging
- Deadline tracking and reminders
- Document status management

### 💬 Community Features

- Community forums and discussions
- Local event listings and notifications
- Peer-to-peer support and networking
- Success stories and tips sharing

### 🎨 Modern UI/UX

- Glass-morphism design language
- Smooth animations and transitions
- Responsive layout for all devices
- Dark/light theme support (planned)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Expat Ease Frontend                     │
├─────────────────────────────────────────────────────────────┤
│  React Application (Vite + TypeScript)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Components  │ │ Contexts    │ │ Pages       │          │
│  │ Reusable UI │ │ State Mgmt  │ │ Route Views │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Styling & Assets                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Tailwind    │ │ Custom CSS  │ │ Assets      │          │
│  │ CSS         │ │ Classes     │ │ Images/SVG  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  API Integration                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           FastAPI Backend Communication                 ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      ││
│  │  │ Auth    │ │ Tasks   │ │ Docs    │ │ Users   │      ││
│  │  │ API     │ │ API     │ │ API     │ │ API     │      ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Component Structure

### Core Components

```
src/components/
├── Layout.tsx              # Main application layout with navigation
├── Container.tsx           # Reusable container component
├── Dashboard.tsx           # Main dashboard with feature cards
├── LoginForm.tsx           # User authentication form
├── RegisterForm.tsx        # User registration form
├── CountrySelection.tsx    # Country selection interface
├── ChecklistStep.tsx       # Individual checklist step component
└── DocumentsSection.tsx    # Document management interface
```

### Page Components

```
src/pages/
└── ChecklistPage.tsx       # Settlement checklist page
```

### Context Providers

```
src/contexts/
└── AuthContext.tsx         # Authentication state management
```

## 🛠️ Tech Stack

### Core Technologies

- **React 19.1.1** - Latest React with improved performance
- **TypeScript 5.8.3** - Type-safe JavaScript development
- **Vite 7.1.7** - Fast build tool and development server

### Styling & UI

- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing and optimization
- **Autoprefixer 10.4.21** - CSS vendor prefix automation

### Development Tools

- **ESLint 9.36.0** - Code linting and quality assurance
- **TypeScript ESLint** - TypeScript-specific linting rules
- **React Hooks ESLint** - React hooks linting rules

### Routing & Navigation

- **React Router DOM 7.9.1** - Client-side routing and navigation

## 🚀 Setup & Installation

### Prerequisites

- **Node.js 18+** and npm
- **Git**

### 1. Clone and Navigate

```bash
git clone https://github.com/yourusername/expat-ease.git
cd expat-ease/expat-ease-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1

# Application Configuration
VITE_APP_NAME=Expat Ease
VITE_APP_VERSION=1.0.0
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Verify Installation

- **Frontend**: <http://localhost:5173>
- **Backend API**: Ensure backend is running on <http://localhost:8000>

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Build Analysis
npm run build -- --analyze  # Analyze bundle size
```

### Development Workflow

1. **Start Backend**: Ensure the FastAPI backend is running
2. **Start Frontend**: Run `npm run dev`
3. **Hot Reload**: Changes are automatically reflected in the browser
4. **Type Checking**: TypeScript errors are shown in the terminal and browser

### Code Organization

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common/shared components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page-level components
├── services/           # API service functions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── assets/             # Static assets
├── App.tsx             # Main App component
├── main.tsx            # Application entry point
├── index.css           # Global styles
└── vite-env.d.ts       # Vite type definitions
```

## 🎨 Styling

### Tailwind CSS Configuration

The project uses a custom Tailwind configuration with:

- **Custom Color Palette**: Brand colors and semantic colors
- **Glass Morphism**: Backdrop blur and transparency effects
- **Custom Animations**: Smooth transitions and hover effects
- **Responsive Design**: Mobile-first breakpoints

### Custom CSS Classes

```css
/* Glass morphism effects */
.glass {
  @apply bg-white/10 backdrop-blur-md border border-white/20;
}

.card {
  @apply bg-white rounded-2xl shadow-lg border border-slate-200;
}

.card-hover {
  @apply transition-all duration-300 hover:shadow-xl hover:scale-105;
}

/* Button styles */
.btn {
  @apply px-6 py-3 rounded-xl font-semibold transition-all duration-200;
}

.btn-primary {
  @apply bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl;
}

/* Text gradients */
.text-gradient {
  @apply bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent;
}
```

## 🔄 State Management

### Context-Based State Management

The application uses React Context for state management:

```typescript
// AuthContext for authentication state
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  loading: boolean;
}

// Usage in components
const { user, login, logout } = useAuth();
```

### State Management Patterns

- **Context API**: For global state (authentication, user data)
- **Local State**: For component-specific state
- **Props Drilling**: Minimized through proper component structure
- **Custom Hooks**: For reusable stateful logic

## 🔌 API Integration

### API Service Layer

```typescript
// services/api.ts
class ApiService {
  private baseURL: string;
  
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    return response.json();
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
```

## 🚀 Build & Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and CSS optimization
- **Bundle Analysis**: Use `--analyze` flag for bundle inspection

### Deployment Options

#### Static Hosting (Vercel, Netlify)

```bash
# Build command
npm run build

# Output directory
dist/
```

#### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Install serve for production
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Make your changes**
5. **Run linting**:

   ```bash
   npm run lint
   ```

6. **Commit your changes**:

   ```bash
   git commit -m 'feat: add amazing feature'
   ```

7. **Push to the branch**:

   ```bash
   git push origin feature/amazing-feature
   ```

8. **Open a Pull Request**

### Code Standards

- **TypeScript**: Use strict type checking
- **ESLint**: Follow configured linting rules
- **Component Structure**: Use functional components with hooks
- **Styling**: Use Tailwind CSS utility classes
- **Naming**: Use descriptive, camelCase names
- **Documentation**: Add JSDoc comments for complex functions

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)

## 📞 Support

- **Issues**: Report bugs via [GitHub Issues](https://github.com/yourusername/expat-ease/issues)
- **Discussions**: Join community discussions
- **Documentation**: Check the main project README

---

**Built with ❤️ using React 19, TypeScript, and modern web technologies**
