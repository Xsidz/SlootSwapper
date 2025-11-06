# 🔄 SlotSwapper

> A peer-to-peer time-slot exchange platform that enables users to manage calendar events and exchange time slots with other users through a marketplace interface.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Environment Configuration](#-environment-configuration)
- [Available Scripts](#-available-scripts)
- [Docker Development](#-docker-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based authentication and registration
- 📅 **Calendar Management** - Create, view, and manage calendar events
- 🏪 **Marketplace** - Browse and search available time slots
- 🔄 **Slot Exchange** - Request and approve time slot swaps with other users
- 🔔 **Real-time Notifications** - Get notified about swap requests and updates
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Clean, intuitive interface built with Tailwind CSS

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with Vite plugin
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Rate Limit** - API rate limiting

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands simultaneously
- **Docker** - Containerization for development

## 📁 Project Structure

```
slot-swapper/
├── 📁 frontend/                    
│   ├── 📁 src/
│   │   ├── 📁 components/         
│   │   │   ├── Auth/              
│   │   │   ├── Calendar/          
│   │   │   ├── Marketplace/       
│   │   │   └── UI/                
│   │   ├── 📁 pages/             
│   │   ├── 📁 hooks/             
│   │   ├── 📁 services/           
│   │   ├── 📁 store/              
│   │   ├── 📁 utils/             
│   │   ├── App.jsx               
│   │   ├── main.jsx              
│   │   └── index.css              
│   ├── package.json
│   ├── vite.config.js            
│   ├── tailwind.config.js         
│   ├── .env.example               
│   └── Dockerfile                 
├── 📁 backend/                     
│   ├── 📁 models/                 
│   ├── 📁 routes/                 
│   ├── 📁 controllers/            
│   ├── 📁 middleware/             
│   ├── 📁 utils/                 
│   ├── 📁 config/                
│   ├── 📁 tests/                 
│   ├── server.js                  
│   ├── package.json
│   ├── .env.production.example    
│   └── Dockerfile                 
├── 📁 .github/workflows/         
├── docker-compose.yml             
├── mongo-init.js                  
├── package.json                   
└── README.md                     
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (choose one):
  - Local installation - [Download here](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas (cloud) - [Sign up here](https://www.mongodb.com/atlas)
  - Docker (for containerized development)
- **Git** - [Download here](https://git-scm.com/)

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/slot-swapper.git
cd slot-swapper
```

### 2. Install Dependencies

**Option A: Install All Dependencies (Recommended)**
```bash
npm run install:all
```

**Option B: Install Individually**
```bash
# Install frontend dependencies
npm run install:frontend

# Install backend dependencies
npm run install:backend
```

### 3. Set Up Environment Variables

**Frontend Environment:**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:5002/api
VITE_NODE_ENV=development
```

**Backend Environment:**
```bash
cd backend
cp .env.production.example .env
```

Edit `backend/.env`:
```env
# Backend Environment Variables
NODE_ENV=development
PORT=5002

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/slotswapper

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 4. Set Up Database

**Option A: Local MongoDB**
1. Start MongoDB service on your system
2. The application will automatically create the database

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

**Option C: Docker (See Docker Development section)**

## 💻 Development

### Quick Start (Recommended)

Start both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002
- **API Documentation**: http://localhost:5002/api-docs (if available)

### Individual Development

Start services separately:
```bash
# Start backend only
npm run dev:backend

# Start frontend only (in another terminal)
npm run dev:frontend
```

### Development Workflow

1. **Make Changes**: Edit files in `frontend/src/` or `backend/`
2. **Auto Reload**: Both servers automatically restart on file changes
3. **Check Logs**: Monitor console output for errors
4. **Test Features**: Use the web interface at http://localhost:5173

## ⚙️ Environment Configuration

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5002/api` | ✅ |
| `VITE_NODE_ENV` | Environment mode | `development` | ❌ |

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | ✅ |
| `PORT` | Server port | `5002` | ✅ |
| `MONGODB_URI` | MongoDB connection string | - | ✅ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` | ✅ |

## 📜 Available Scripts

### Root Level Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run install:all` | Install all dependencies |
| `npm run build` | Build frontend for production |
| `npm run lint` | Run linting on both projects |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run docker:up` | Start with Docker Compose |
| `npm run docker:down` | Stop Docker containers |

### Frontend Scripts

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
```

### Backend Scripts

```bash
cd backend
npm run dev          # Start with nodemon
npm run start        # Start production server
npm run test         # Run unit tests
npm run test:integration # Run integration tests
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
```

## 🐳 Docker Development

### Prerequisites for Docker
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Start with Docker

```bash
# Start all services (MongoDB, Backend, Frontend)
npm run docker:up

# Or use Docker Compose directly
docker-compose up --build
```

### Docker Services

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 5002 | http://localhost:5002 |
| MongoDB | 27017 | mongodb://localhost:27017 |

### Docker Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
npm run docker:down

# Rebuild containers
docker-compose up --build

# Remove volumes (reset database)
docker-compose down -v
```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run all tests
npm run test:raw
```

### Frontend Testing

```bash
cd frontend

# Run linting (includes basic checks)
npm run lint

# Check build
npm run build
```

## 🚀 Deployment

SlotSwapper supports multiple deployment options:

### Quick Deploy Options

- **[📖 Deployment Guide](DEPLOYMENT.md)** - Complete guide for Render + Vercel
- **[✅ Deployment Checklist](DEPLOYMENT-CHECKLIST.md)** - Step-by-step verification
- **[🐳 Docker Guide](DOCKER.md)** - Docker deployment instructions

### Recommended Stack

- **Frontend**: Vercel (automatic deployments from Git)
- **Backend**: Render (free tier available)
- **Database**: MongoDB Atlas (free tier available)

### Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] JWT secret generated (secure, 64+ characters)
- [ ] CORS settings updated for production URLs
- [ ] Build process tested locally
- [ ] All tests passing

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
GET  /api/auth/me          # Get current user
```

### Calendar Endpoints

```
GET    /api/events         # Get user events
POST   /api/events         # Create new event
PUT    /api/events/:id     # Update event
DELETE /api/events/:id     # Delete event
```

### Marketplace Endpoints

```
GET  /api/marketplace      # Get available slots
POST /api/marketplace      # List slot for exchange
GET  /api/marketplace/:id  # Get slot details
```

### Exchange Endpoints

```
POST /api/exchanges        # Request slot exchange
PUT  /api/exchanges/:id    # Approve/reject exchange
GET  /api/exchanges        # Get user exchanges
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm run test`
5. **Run linting**: `npm run lint:fix`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Use meaningful commit messages

## 🔧 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill process on port 5002 (backend)
lsof -ti:5002 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

**2. MongoDB Connection Issues**
- Ensure MongoDB is running locally
- Check connection string in `.env`
- Verify network connectivity for Atlas

**3. Dependencies Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**4. Environment Variables Not Loading**
- Ensure `.env` files exist in correct locations
- Restart development servers after changes
- Check for typos in variable names

**5. CORS Issues**
- Verify `FRONTEND_URL` in backend `.env`
- Check browser console for specific errors
- Ensure backend is running before frontend

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/yourusername/slot-swapper/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/slot-swapper/discussions)
- **Documentation**: Check the `/docs` folder for detailed guides

### Performance Tips

- Use `npm run build` to test production builds locally
- Monitor bundle size with `npm run build` output
- Use browser dev tools to identify performance bottlenecks
- Consider implementing pagination for large datasets

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

