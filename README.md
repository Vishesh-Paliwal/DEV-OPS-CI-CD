# DevOps CI/CD Pipeline Project

![CI/CD Pipeline](https://github.com/<your-username>/<your-repo>/actions/workflows/ci.yml/badge.svg)
[![Docker Hub](https://img.shields.io/badge/docker-hub-blue.svg)](https://hub.docker.com/r/<your-username>/<your-repo>)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-grade CI/CD pipeline demonstration using GitHub Actions with a Node.js Express REST API.

## Overview

### Project Objectives

This project demonstrates how to build a complete CI/CD pipeline that:
- **Automates quality checks** - Catch bugs and issues before they reach production
- **Enforces security best practices** - Multiple layers of security scanning
- **Ensures code consistency** - Automated linting and formatting
- **Validates functionality** - Comprehensive unit and property-based testing
- **Containerizes applications** - Docker-based deployment strategy
- **Automates deployment** - Push validated images to DockerHub automatically

### Key Features

### Key Features

This project demonstrates modern DevOps practices including:
- Automated testing (unit tests and property-based tests)
- Security scanning (SAST with CodeQL, SCA with npm audit)
- Code quality enforcement (ESLint)
- Containerization (Docker)
- Container security scanning (Trivy)
- Automated deployment (DockerHub)

## Project Structure

```
.
├── src/
│   ├── app.js              # Main application entry point
│   ├── routes/             # API route definitions
│   ├── controllers/        # Request handlers
│   ├── data/               # Data layer (in-memory storage)
│   └── utils/              # Utility functions
├── tests/
│   ├── unit/               # Unit tests
│   └── property/           # Property-based tests
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD pipeline configuration
├── Dockerfile              # Container image definition
└── package.json            # Project dependencies
```

## Local Development Setup

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Docker (for containerization)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd devops-cicd-pipeline
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the application locally:
```bash
npm start
```

The API will be available at `http://localhost:3000`

### Running Tests

Run all tests:
```bash
npm test
```

Run unit tests only:
```bash
npm run test:unit
```

Run property-based tests only:
```bash
npm run test:property
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Code Quality

Run linting:
```bash
npm run lint
```

### Building Docker Image

Build the Docker image locally:
```bash
docker build -t devops-cicd-pipeline:latest .
```

Run the container:
```bash
docker run -p 3000:3000 devops-cicd-pipeline:latest
```

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

## API Endpoints

### Health Check
- **GET** `/health` - Returns application health status

### Users
- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create a new user

## CI/CD Pipeline

The GitHub Actions pipeline is the heart of this project, automating quality, security, and deployment processes. Each stage serves a specific purpose in ensuring only high-quality, secure code reaches production.

### Pipeline Stages with Rationale

#### 1. Checkout Code
**Purpose**: Retrieve source code from the repository  
**Why It Matters**: Foundation for all subsequent stages  
**Failure Impact**: Pipeline cannot proceed  

#### 2. Setup Node.js Runtime
**Purpose**: Install Node.js 18.x and cache dependencies  
**Why It Matters**: Ensures consistent runtime environment across all builds, speeds up subsequent runs through caching  
**Failure Impact**: Cannot install dependencies or run application  
**Optimization**: Dependency caching reduces build time by 30-50%

#### 3. Linting (ESLint)
**Purpose**: Enforce code quality and style standards  
**Why It Matters**: Prevents technical debt, catches common bugs early (unused variables, missing semicolons, etc.), maintains team consistency  
**Failure Impact**: Blocks pipeline immediately (fail-fast approach)  
**Tools**: ESLint with recommended rules  
**Rationale**: Running linting before tests saves time - no point running tests on poorly formatted code

#### 4. Static Application Security Testing - SAST (CodeQL)
**Purpose**: Analyze source code for security vulnerabilities  
**Why It Matters**: Detects OWASP Top 10 issues (SQL injection, XSS, command injection) before they reach production  
**Failure Impact**: Security findings reported to GitHub Security tab for review  
**Tools**: GitHub CodeQL (free for public repositories)  
**Runs**: In parallel with tests to save time  
**Rationale**: Shift-left security - find vulnerabilities early when they're cheaper to fix

#### 5. Unit and Property Tests (Jest + fast-check)
**Purpose**: Validate business logic and correctness properties  
**Why It Matters**: Prevents regressions, ensures features work as specified, validates edge cases  
**Failure Impact**: Blocks pipeline, prevents broken code from deploying  
**Tools**: Jest for unit tests, fast-check for property-based tests  
**Coverage**: Minimum 80% code coverage required  
**Rationale**: Dual testing approach (unit + property) provides comprehensive validation

#### 6. Software Composition Analysis - SCA (npm audit)
**Purpose**: Scan dependencies for known vulnerabilities  
**Why It Matters**: Identifies supply chain risks, prevents vulnerable packages from reaching production  
**Failure Impact**: Blocks pipeline on critical vulnerabilities  
**Tools**: npm audit (built-in, free)  
**Rationale**: 80% of code in modern apps comes from dependencies - must validate them

#### 7. Build Application
**Purpose**: Prepare application for containerization  
**Why It Matters**: Validates that application can be built successfully  
**Failure Impact**: Blocks containerization  
**Output**: Compiled/prepared application files

#### 8. Docker Build
**Purpose**: Create container image  
**Why It Matters**: Packages application with dependencies for consistent deployment across environments  
**Failure Impact**: Blocks deployment  
**Output**: Docker image tagged with commit SHA and 'latest'  
**Rationale**: Containers ensure "works on my machine" becomes "works everywhere"

#### 9. Container Security Scan (Trivy)
**Purpose**: Scan container image for OS and dependency vulnerabilities  
**Why It Matters**: Prevents vulnerable images from shipping to production, catches issues in base image and dependencies  
**Failure Impact**: Reports findings to GitHub Security tab, blocks on critical vulnerabilities  
**Tools**: Trivy (free, comprehensive, fast)  
**Output**: SARIF report uploaded to GitHub Security  
**Rationale**: Container images can have vulnerabilities even if source code is clean

#### 10. Container Runtime Test
**Purpose**: Validate that container actually runs correctly  
**Why It Matters**: Ensures image is functional before publishing - catches runtime issues, missing dependencies, configuration errors  
**Failure Impact**: Blocks publishing to DockerHub  
**Test**: Start container, make HTTP request to /health endpoint, verify 200 response  
**Rationale**: Build success doesn't guarantee runtime success - must validate

#### 11. Publish to DockerHub
**Purpose**: Push validated image to container registry  
**Why It Matters**: Makes image available for deployment to production environments  
**Failure Impact**: Deployment cannot proceed  
**Authentication**: GitHub Secrets (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)  
**Tags**: Both commit SHA (for traceability) and 'latest' (for convenience)  
**Rationale**: Only publish images that passed all quality and security checks

### Pipeline Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Developer                                │
│                              │                                   │
│                              ▼                                   │
│                    ┌──────────────────┐                         │
│                    │   Git Push to    │                         │
│                    │  GitHub (master) │                         │
│                    └────────┬─────────┘                         │
│                             │                                   │
│                             ▼                                   │
│              ┌──────────────────────────────┐                  │
│              │   GitHub Actions Trigger     │                  │
│              └──────────────┬───────────────┘                  │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CI Pipeline Stages                            │
│                                                                  │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐           │
│  │  Checkout  │───▶│   Setup    │───▶│  Linting   │           │
│  │    Code    │    │  Node.js   │    │  (ESLint)  │           │
│  └────────────┘    └────────────┘    └──────┬─────┘           │
│                                              │                  │
│                    ┌─────────────────────────┘                  │
│                    │                                            │
│         ┌──────────▼──────────┐    ┌────────────────┐          │
│         │   Unit Tests        │    │  CodeQL SAST   │          │
│         │   (Jest)            │    │  (Parallel)    │          │
│         └──────────┬──────────┘    └────────────────┘          │
│                    │                                            │
│                    ▼                                            │
│         ┌──────────────────────┐                               │
│         │  Dependency Scan     │                               │
│         │  (npm audit)         │                               │
│         └──────────┬───────────┘                               │
│                    │                                            │
│                    ▼                                            │
│         ┌──────────────────────┐                               │
│         │  Build Application   │                               │
│         └──────────┬───────────┘                               │
│                    │                                            │
│                    ▼                                            │
│         ┌──────────────────────┐                               │
│         │  Docker Build        │                               │
│         └──────────┬───────────┘                               │
│                    │                                            │
│                    ▼                                            │
│         ┌──────────────────────┐                               │
│         │  Container Scan      │                               │
│         │  (Trivy)             │                               │
│         └──────────┬───────────┘                               │
│                    │                                            │
│                    ▼                                            │
│         ┌──────────────────────┐                               │
│         │  Runtime Test        │                               │
│         │  (Health Check)      │                               │
│         └──────────┬───────────┘                               │
│                    │                                            │
│                    ▼                                            │
│         ┌──────────────────────┐                               │
│         │  Push to DockerHub   │                               │
│         └──────────────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### GitHub Secrets Configuration

To enable DockerHub publishing, you must configure the following secrets in your GitHub repository:

#### Step-by-Step Setup:

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click **Settings** → **Secrets and variables** → **Actions**

2. **Create DockerHub Access Token**
   - Log in to [DockerHub](https://hub.docker.com)
   - Go to **Account Settings** → **Security**
   - Click **New Access Token**
   - Give it a descriptive name (e.g., "GitHub Actions CI/CD")
   - Set permissions to **Read & Write**
   - Copy the generated token (you won't see it again!)

3. **Add Secrets to GitHub**
   - Back in GitHub repository settings, click **New repository secret**
   - Add the following two secrets:

   **Secret 1: DOCKERHUB_USERNAME**
   - Name: `DOCKERHUB_USERNAME`
   - Value: Your DockerHub username (e.g., `johndoe`)

   **Secret 2: DOCKERHUB_TOKEN**
   - Name: `DOCKERHUB_TOKEN`
   - Value: The access token you copied from DockerHub

4. **Verify Configuration**
   - Push code to master branch
   - Check GitHub Actions tab to see if the pipeline runs
   - Verify the "Publish to DockerHub" stage succeeds
   - Check your DockerHub repository for the published image

**Security Note**: Never commit DockerHub credentials to your repository. Always use GitHub Secrets for sensitive information.

## Testing Strategy

This project uses a dual testing approach:

### Unit Tests
- Verify specific examples and edge cases
- Test individual functions and components
- Located in `tests/unit/`

### Property-Based Tests
- Verify universal properties across many inputs
- Use fast-check library for random input generation
- Run 100+ iterations per property
- Located in `tests/property/`

## Security

The pipeline includes multiple security layers following the "shift-left" security approach:

### Security Scanning Layers

1. **SAST (Static Application Security Testing)**: 
   - Tool: CodeQL
   - Scans: Source code for vulnerabilities
   - Detects: SQL injection, XSS, command injection, path traversal, etc.
   - Reports: GitHub Security tab

2. **SCA (Software Composition Analysis)**: 
   - Tool: npm audit
   - Scans: Dependencies for known vulnerabilities
   - Detects: Vulnerable packages in node_modules
   - Reports: Pipeline logs and fails on critical issues

3. **Container Scanning**: 
   - Tool: Trivy
   - Scans: Docker image for OS and dependency vulnerabilities
   - Detects: Vulnerabilities in base image and application dependencies
   - Reports: GitHub Security tab (SARIF format)

### Security Best Practices Implemented

- **Secrets Management**: All sensitive credentials stored in GitHub Secrets, never in code
- **Minimal Base Image**: Using `node:18-alpine` reduces attack surface
- **Non-Root User**: Container runs as `node` user, not root
- **Production Dependencies Only**: Only necessary packages included in container
- **Fail-Fast on Critical Issues**: Pipeline blocks deployment if critical vulnerabilities found
- **Multiple Validation Layers**: Defense in depth approach with multiple scanning tools

## License

MIT
