# Cernio Development Environment Setup

## ✅ Phase 0 Progress - Structure Complete!

We've successfully created the complete project structure:

### Completed Tasks

- ✅ Monorepo structure with npm workspaces
- ✅ NestJS backend application (`apps/backend/`)
- ✅ React + Vite frontend application (`apps/web/`)
- ✅ Shared packages (`packages/types/`, `packages/utils/`)
- ✅ TypeScript configuration for all projects
- ✅ Tailwind CSS setup
- ✅ ESLint and Prettier configuration
- ✅ Environment configuration templates
- ✅ Health check endpoint in backend
- ✅ Basic routing and layout in frontend

## 🔧 Required Software Installation

To run the project, you need to install the following software:

### 1. Node.js (Required)

**Version:** 20.x LTS or higher

**Download:** https://nodejs.org/

**Installation Steps:**
1. Download the Windows installer (.msi) for Node.js 20 LTS
2. Run the installer
3. Follow the installation wizard (use default settings)
4. Verify installation by opening a new PowerShell and running:
   ```powershell
   node --version
   npm --version
   ```

### 2. PostgreSQL (Required for Phase 1+)

**Version:** 15 or higher

**Download:** https://www.postgresql.org/download/windows/

**Note:** Not needed immediately, but will be required for Phase 1 (Authentication)

### 3. Git (Already Installed)

✅ Git is already set up and working

### 4. VS Code (Recommended)

**Download:** https://code.visualstudio.com/

**Recommended Extensions:**
- ESLint
- Prettier - Code formatter
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- GitLens

## 🚀 Getting Started (After Installing Node.js)

Once Node.js is installed, follow these steps:

### 1. Install Dependencies

Open PowerShell in the project root directory and run:

```powershell
npm install
```

This will install all dependencies for all workspaces (backend, frontend, and packages).

### 2. Start the Development Servers

To run both backend and frontend simultaneously:

```powershell
npm run dev
```

Or run them separately:

```powershell
# Backend only (runs on http://localhost:3000)
npm run dev:backend

# Frontend only (runs on http://localhost:5173)
npm run dev:web
```

### 3. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/v1
- **Health Check:** http://localhost:3000/api/v1/health

### 4. Verify Everything Works

The homepage should show:
- Welcome message
- Backend API status (should show ✅ green if backend is running)
- Phase 0 completion checklist

## 📁 Project Structure

```
cernio/
├── apps/
│   ├── backend/              # NestJS API Server
│   │   ├── src/
│   │   │   ├── main.ts      # Entry point
│   │   │   ├── app.module.ts
│   │   │   └── modules/
│   │   │       └── health/  # Health check endpoint
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   └── web/                  # React Web App
│       ├── src/
│       │   ├── main.tsx     # Entry point
│       │   ├── App.tsx
│       │   ├── components/  # React components
│       │   ├── pages/       # Page components
│       │   └── styles/      # CSS files
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
├── packages/
│   ├── types/               # Shared TypeScript types
│   │   └── src/index.ts
│   └── utils/               # Shared utility functions
│       └── src/index.ts
├── docs/                    # Documentation
│   ├── REQUIREMENTS.md
│   ├── TODO.md
│   └── ISSUES.md
├── package.json             # Root workspace config
├── .gitignore
├── .prettierrc
└── README.md

```

## 🧪 Available Scripts

From the root directory:

```powershell
# Development
npm run dev           # Run both backend and frontend
npm run dev:backend   # Run backend only
npm run dev:web       # Run frontend only

# Build
npm run build         # Build all projects

# Testing
npm run test          # Run tests (to be implemented)

# Linting & Formatting
npm run lint          # Lint all projects
npm run format        # Format code with Prettier
```

## 🔍 Troubleshooting

### Port Already in Use

If you get an error about ports 3000 or 5173 being in use:

**Backend (port 3000):**
```powershell
# Find the process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F
```

**Frontend (port 5173):**
```powershell
# Find the process using port 5173
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <PID> /F
```

### Dependencies Installation Fails

If `npm install` fails:
1. Make sure you have Node.js 20+ installed
2. Delete `node_modules` folders and try again:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

### TypeScript Errors in IDE

If VS Code shows TypeScript errors:
1. Reload the VS Code window: `Ctrl+Shift+P` → "Reload Window"
2. Make sure the TypeScript version in VS Code matches the project

## 📚 Next Steps

After verifying Phase 0 is working:

1. **Phase 1: Authentication & User Management**
   - Install PostgreSQL
   - Set up database schema
   - Implement authentication system
   - User registration and login

2. **Read the Documentation**
   - `docs/REQUIREMENTS.md` - Complete project requirements
   - `docs/TODO.md` - Detailed implementation plan
   - `docs/ISSUES.md` - Technical decisions to be made

## 🆘 Getting Help

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error messages carefully
3. Ensure all required software is installed
4. Check that all ports are available

## 🎯 Current Status

**Phase 0: Project Setup** - ✅ STRUCTURE COMPLETE

Waiting for Node.js installation to test the application.

---

Last Updated: 2025-11-03
