# DevOps CI/CD Pipeline Project

A production-grade CI/CD pipeline demonstration using GitHub Actions with a Node.js Express REST API.

## Overview

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

The GitHub Actions pipeline includes the following stages:

1. **Checkout** - Clone repository code
2. **Setup** - Install Node.js 18.x with dependency caching
3. **Lint** - Run ESLint for code quality
4. **Security Scan (SAST)** - Run CodeQL analysis (parallel)
5. **Test** - Execute Jest unit tests with coverage
6. **Dependency Scan (SCA)** - Run npm audit
7. **Build** - Prepare application for containerization
8. **Docker Build** - Create container image
9. **Container Scan** - Run Trivy security scan
10. **Runtime Test** - Validate container health
11. **Publish** - Push to DockerHub

### Pipeline Architecture

```
Developer Push → GitHub Actions Trigger
                        ↓
                   Checkout Code
                        ↓
                   Setup Node.js
                        ↓
                      Linting
                        ↓
              ┌─────────┴─────────┐
              ↓                   ↓
         Unit Tests          CodeQL SAST
              ↓
       Dependency Scan
              ↓
         Docker Build
              ↓
       Container Scan
              ↓
        Runtime Test
              ↓
      Push to DockerHub
```

### GitHub Secrets Configuration

To enable DockerHub publishing, configure the following secrets in your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `DOCKERHUB_USERNAME` - Your DockerHub username
   - `DOCKERHUB_TOKEN` - Your DockerHub access token

To create a DockerHub access token:
1. Log in to DockerHub
2. Go to **Account Settings** → **Security**
3. Click **New Access Token**
4. Copy the token and add it to GitHub Secrets

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

The pipeline includes multiple security layers:

- **SAST (Static Application Security Testing)**: CodeQL scans source code for vulnerabilities
- **SCA (Software Composition Analysis)**: npm audit checks dependencies for known vulnerabilities
- **Container Scanning**: Trivy scans the Docker image for OS and dependency vulnerabilities
- **Secrets Management**: Sensitive credentials stored in GitHub Secrets

## License

MIT
