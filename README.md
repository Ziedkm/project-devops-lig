<div align="center">

# 🚀 PerfomaIT DevOps CI/CD Pipeline

### Automated Build, Test & Deployment System

[![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)](https://www.jenkins.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**Team:** Zied Kemantar • Wejdene Btach • Ghezlene Btach  
**Course:** Introduction au DevOps - ISG Sousse (3 LIG)  
**Academic Year:** 2025-2026

[📖 Documentation](docs/) • [🐛 Report Bug](https://github.com/Ziedkm/project-devops-lig/issues) • [✨ Request Feature](https://github.com/Ziedkm/project-devops-lig/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Built With](#️-built-with)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Jenkins Pipeline Usage](#-jenkins-pipeline-usage)
- [Docker Commands](#-docker-commands)
- [Testing](#-testing)
- [Versioning Strategy](#-versioning-strategy)
- [Team Contributions](#-team-contributions)
- [License](#-license)

---

## 📖 About The Project

This project implements a **complete CI/CD pipeline** for the PerfomaIT Absence Management System, a React-based web application for tracking employee work days and absences. The DevOps infrastructure automates building, testing, and deployment using industry-standard tools.

### 🎯 Key Features

✅ **3 Automated Jenkins Pipelines** - PR validation, Dev integration, Release management  
✅ **Multi-Stage Docker Build** - Optimized containerization (Node.js build + Nginx serve)  
✅ **Automated Smoke Testing** - Health checks on every build  
✅ **Git Workflow** - Branch protection, Pull Requests, Semantic Versioning  
✅ **Secure Credential Management** - Environment variables via Jenkins Credentials  
✅ **Artifact Archival** - Production-ready builds stored in Jenkins

---

## 🛠️ Built With

### Core Technologies

| Category | Technology |
|:---------|:-----------|
| **Frontend** | React 18, Vite, TailwindCSS |
| **Backend** | Supabase (BaaS) |
| **CI/CD** | Jenkins, Git, GitHub |
| **Containerization** | Docker (Multi-stage builds) |
| **Web Server** | Nginx Alpine |
| **Runtime** | Node.js 20 Alpine |

### DevOps Tools

- **Version Control:** Git, GitHub
- **Automation:** Jenkins Pipelines (Declarative)
- **Testing:** Custom Batch smoke tests
- **Scripting:** PowerShell, Batch (Windows)

---

## 🏗️ Architecture

### CI/CD Pipeline Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Developer  │──┬──→│  Pull Request│─────→│  PR Pipeline │
│   Commits    │  │   │   to dev     │      │   (Port 8083)│
└──────────────┘  │   └──────────────┘      └──────────────┘
                  │                                 │
                  │                          [Build → Test]
                  │                                 │
                  │   ┌──────────────┐      ┌──────────────┐
                  └──→│  Merge to dev│─────→│  Dev Pipeline│
                      └──────────────┘      │   (Port 8082)│
                                            └──────────────┘
                                                   │
                                            [Full Integration]
                                                   │
                      ┌──────────────┐      ┌──────────────┐
                      │  Create Tag  │─────→│   Release    │
                      │   (v1.0.0)   │      │   Pipeline   │
                      └──────────────┘      │   (Port 8084)│
                                            └──────────────┘
                                                   │
                                            [Archive Artifacts]
```

### Docker Multi-Stage Build

```
Stage 1: Builder (node:20-alpine)
    ↓
[npm install + npm run build]
    ↓
Stage 2: Server (nginx:alpine)
    ↓
[Copy dist/ → Serve static files]
```

**Result:** Final image size reduced by ~80%

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

```
# Required
✓ Git 2.40+
✓ Docker Desktop 24.0+
✓ Jenkins 2.400+
✓ Node.js 20+ (for local development)

# Optional
✓ VS Code with Docker extension
```

### Installation

1. **Clone the repository**
   ```
   git clone https://github.com/Ziedkm/project-devops-lig.git
   cd project-devops-lig
   ```

2. **Checkout the development branch**
   ```
   git checkout dev
   ```

3. **Install dependencies**
   ```
   npm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SUPABASE_SERVICE_KEY=your_service_key
   ```

5. **Build and run with Docker**
   ```
   docker build -t performait-app .
   docker run -d -p 8080:80 performait-app
   ```

6. **Access the application**
   
   Open your browser to `http://localhost:8080`

---

## ⚙️ Jenkins Pipeline Usage

### Pipeline Overview

| Pipeline | File | Trigger | Port |
|:---------|:-----|:--------|:-----|
| **PR Check** | `Jenkinsfile_PR` | Pull Request to `dev` | 8083 |
| **Dev Build** | `Jenkinsfile_Dev` | Push to `dev` branch | 8082 |
| **Release** | `Jenkinsfile_Release` | Git tag `v*.*.*` | 8084 |

### Setting Up Jenkins Jobs

#### 1. Pull Request Pipeline
```
Job Name: 01_Pull_Request_Check
Pipeline from SCM → Git
Repository URL: https://github.com/Ziedkm/project-devops-lig.git
Script Path: Jenkinsfile_PR
Branch Specifier: */pr/*
```

#### 2. Development Pipeline
```
Job Name: 02_Dev_Build
Pipeline from SCM → Git
Repository URL: https://github.com/Ziedkm/project-devops-lig.git
Script Path: Jenkinsfile_Dev
Branch Specifier: */dev
```

#### 3. Release Pipeline
```
Job Name: 03_Release_Version
Pipeline from SCM → Git
Repository URL: https://github.com/Ziedkm/project-devops-lig.git
Script Path: Jenkinsfile_Release
Branch Specifier: refs/tags/v*
```

### Jenkins Credentials Setup

Add these credentials in Jenkins (`Manage Jenkins → Credentials`):

| ID | Type | Description |
|:---|:-----|:------------|
| `SUPABASE_URL` | Secret Text | Supabase project URL |
| `SUPABASE_KEY` | Secret Text | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Secret Text | Supabase service role key |

---

## 🐳 Docker Commands

### Local Development

```
# Build the image
docker build -t performait-app .

# Run the container
docker run -d -p 8080:80 --name performait performait-app

# View logs
docker logs performait

# Stop and remove
docker stop performait
docker rm performait

# Remove image
docker rmi performait-app
```

### Troubleshooting

```
# Check running containers
docker ps

# Check all containers (including stopped)
docker ps -a

# Force remove container
docker rm -f performait

# Rebuild without cache
docker build --no-cache -t performait-app .
```

---

## 🧪 Testing

### Smoke Test

The smoke test verifies the application is running and responding to HTTP requests.

**Usage:**
```
# Test on port 8083 (PR Pipeline)
smoke_test.bat 8083

# Test on port 8082 (Dev Pipeline)
smoke_test.bat 8082

# Test on port 8084 (Release Pipeline)
smoke_test.bat 8084
```

**What it checks:**
- ✅ Container is running
- ✅ Nginx is serving content
- ✅ Application returns HTTP 200 status

### Manual Testing

```
# Quick health check
curl http://localhost:8080

# Full header check
curl -I http://localhost:8080
```

---

## 🏷️ Versioning Strategy

We use **Semantic Versioning** (SemVer) with Git tags:

### Format
```
v[MAJOR].[MINOR].[PATCH]
```

### Examples
- `v1.0.0` - Initial release
- `v1.0.1` - Bug fix
- `v1.1.0` - New feature (backward compatible)
- `v2.0.0` - Breaking changes

### Creating a Release

```
# 1. Ensure you're on the dev branch
git checkout dev

# 2. Create a tag
git tag v1.0.0

# 3. Push the tag (triggers Release Pipeline)
git push origin v1.0.0

# 4. View all tags
git tag -l
```

---

## 👥 Team Contributions

| Member | Role | Responsibilities |
|:-------|:-----|:-----------------|
| **Zied Kemantar** | Docker Architect (Member A) | Multi-stage Dockerfile, `.dockerignore`, local testing |
| **Wejdene Btach** | CI Engineer (Member B) | `Jenkinsfile_PR`, `Jenkinsfile_Dev`, `smoke_test.bat` |
| **Ghezlene Btach** | Release Manager (Member C) | `Jenkinsfile_Release`, Jenkins config, documentation |

---

## 📚 Project Structure

```
project-devops-lig/
├── 📄 Dockerfile                 # Multi-stage Docker build
├── 📄 .dockerignore              # Docker build optimization
├── 📄 Jenkinsfile_PR             # Pull Request pipeline
├── 📄 Jenkinsfile_Dev            # Development pipeline
├── 📄 Jenkinsfile_Release        # Release pipeline
├── 📄 smoke_test.bat             # Health check script
├── 📄 package.json               # Node dependencies
├── 📄 vite.config.js             # Vite configuration
├── 📄 README.md                  # This file
├── 📁 src/                       # React source code
├── 📁 public/                    # Static assets
└── 📁 dist/                      # Production build (generated)
```

---

## 📝 License

This project is an academic assignment for **ISG Sousse - Département Informatique**.

**Course:** DevOps (3 LIG)  
**Instructor:** Zaineb SAKHRAWI  
**Academic Year:** 2025-2026

---

## 🤝 Contributing

### Git Workflow

1. Create a feature branch from `dev`
   ```
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit
   ```
   git add .
   git commit -m "feat: your feature description"
   ```

3. Push and create Pull Request
   ```
   git push origin feature/your-feature-name
   # Open PR on GitHub targeting 'dev' branch
   ```

4. Wait for PR Pipeline to pass ✅

5. Merge after approval

---

## 📞 Contact & Support

**Project Repository:** [https://github.com/Ziedkm/project-devops-lig](https://github.com/Ziedkm/project-devops-lig)

**Team Members:**
- Zied Kemantar (GitHub: [@Ziedkm](https://github.com/Ziedkm))
- Wejdene Btach
- Ghezlene Btach

**Report Issues:** [GitHub Issues](https://github.com/Ziedkm/project-devops-lig/issues)

---

<div align="center">

### ⭐ Star this repository if you found it helpful!


</div>