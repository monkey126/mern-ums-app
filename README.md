# MERN UMS App — Secure User Management System with RBAC
[![Releases](https://img.shields.io/github/v/release/monkey126/mern-ums-app?label=Releases&style=for-the-badge)](https://github.com/monkey126/mern-ums-app/releases)

[![Cloudinary](https://img.shields.io/badge/Cloudinary-FF7A59?style=flat&logo=cloudinary&logoColor=white)](https://cloudinary.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/) [![Prisma](https://img.shields.io/badge/Prisma-2F365F?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/) [![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

![UMS screenshot](https://raw.githubusercontent.com/monkey126/mern-ums-app/main/docs/assets/ums-screenshot.png)

A modern MERN stack User Management System. It includes secure authentication, role-based access control (RBAC), activity tracking, responsive UI, and advanced security features. Use it as a starter, production base, or learning kit.

Badges: cloudinary, cors, helmet, jest, jwt, mern-stack, mongodb, nodemailer, pino, prisma, rate-limiting, rbac, react-form-hook, shadcn-ui, tanstack-query, typescript, user-management, zod, zustand.

- Repository Releases: https://github.com/monkey126/mern-ums-app/releases  
  Download the release file from the link above and execute it to run packaged installers or setup scripts.

Contents
- Features
- Architecture
- Tech stack
- Quick start
- Backend: install, env, database, run
- Frontend: install, env, run
- Auth flow & RBAC
- Activity tracking & logging
- Security & production tips
- Tests & CI
- Contributing
- License
- Releases

Features
- Secure authentication with JWT (access + refresh), HttpOnly cookies.
- Role-based access control (admin, manager, user) and route guards.
- Prisma on MongoDB for schema, querying, and seeding.
- Cloudinary for avatar and file uploads.
- Zod-powered validation on server and client.
- React + TypeScript frontend with TanStack Query and React Hook Form.
- Shadcn UI components and Tailwind CSS for a consistent design system.
- State management with Zustand.
- Rate limiting and helmet for hardening Express.
- CORS controlled with allowlist and strict policies.
- Email via Nodemailer for invites, password reset, and notifications.
- Activity logs stored in MongoDB with query endpoints.
- Structured logging with pino.
- Unit and integration tests with Jest.
- CI-ready scripts and Docker-friendly setup.

Architecture
- Client: React + TypeScript, TanStack Query, React Hook Form, Shadcn UI, Zustand.
- Server: Node.js + Express, TypeScript, Prisma (MongoDB), Zod validation.
- Auth: JWT access token (short life) + refresh token (long life) in HttpOnly cookie.
- Storage: Cloudinary for media, MongoDB for data.
- Logging: pino for structured logs, optional external sink.
- CI/CD: GitHub Actions + Docker.

Tech stack (high level)
- Frontend: React, TypeScript, TanStack Query, React Hook Form, Shadcn UI, Zustand, Tailwind CSS.
- Backend: Node.js, Express, TypeScript, Prisma (MongoDB), Zod, bcrypt, jsonwebtoken, helmet, cors, express-rate-limit.
- Dev & Ops: Jest, Supertest, pino, nodemailer, Cloudinary, Docker, GitHub Actions.

Quick start (local)
- Requirements:
  - Node.js 18+
  - npm or pnpm
  - MongoDB (URI) or MongoDB Atlas
  - Cloudinary account for uploads
  - SMTP credentials for email

Clone
```bash
git clone https://github.com/monkey126/mern-ums-app.git
cd mern-ums-app
```

Backend setup
1. Install
```bash
cd server
npm install
```

2. Environment variables (.env)
Create server/.env and add:
```
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster0.mongodb.net/mern_ums?retryWrites=true&w=majority"
JWT_ACCESS_SECRET="change_this_access_secret"
JWT_REFRESH_SECRET="change_this_refresh_secret"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="supersecret"
FRONTEND_URL="http://localhost:3000"
LOG_LEVEL="info"
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

3. Prisma (MongoDB)
```bash
npx prisma generate
npx prisma db push
# seed data (creates admin user and roles)
npm run prisma:seed
```

4. Run server
```bash
npm run dev
# or for prod
npm run start
```

Frontend setup
1. Install
```bash
cd client
npm install
```

2. Client .env
Create client/.env:
```
VITE_API_URL=http://localhost:4000/api
VITE_CLOUDINARY_CLOUD_NAME=<cloud_name>
```

3. Run
```bash
npm run dev
```

Release file
- Releases page: https://github.com/monkey126/mern-ums-app/releases  
  Download the release file shown for the version you want. Execute the included setup script or run the packaged install command inside the archive. The released archive contains server and client build artifacts and a run.sh or install.sh you can execute.

Auth flow & RBAC
- Registration: server validates with Zod, hashes password with bcrypt, stores user in MongoDB via Prisma.
- Login: server issues access token and refresh token. Access token returns in JSON. Refresh token sets in HttpOnly cookie with Secure flag in production.
- Access control:
  - Roles: admin, manager, user.
  - Permissions map stored in config. Middleware extracts user role from token and verifies permission.
  - Admin endpoints allow user management: create, update, disable, delete.
- Token lifecycle:
  - Access token lifetime short (15m).
  - Refresh token lifetime longer (7d).
  - Refresh token endpoint rotates token on use. Server stores refresh token hash per-user to support revocation.

Activity tracking & logging
- Activity logs:
  - Each user action that mutates state writes an entry to activity_logs collection.
  - Entry: userId, action, ip, userAgent, route, payloadDiff, timestamp.
  - Server exposes paged endpoints to search, filter by user, action, date.
- Logging:
  - pino outputs JSON logs.
  - Middleware logs request id, route, response time, status.
  - Error handler logs stack and context.
  - Integrate with ELK, Datadog, or any log aggregator in production.

Security & production tips
- Use helmet to set secure HTTP headers.
- Use express-rate-limit with a whitelist for internal IPs.
- Use CORS with a strict allowlist. Do not use wildcard in production.
- Store secrets with a vault or environment management service.
- Use HTTPS and set cookie Secure flag.
- Create a process to rotate JWT secrets and revoke active sessions by clearing stored refresh token hash.
- Validate all input with Zod on server and client.
- Enforce strong password policy and add MFA later.

File uploads
- Use Cloudinary SDK on server to upload avatars and application files.
- Sanitize file names and use signed upload if needed.
- Store only Cloudinary asset ids in DB.

Email
- Nodemailer sends verification, password reset, and invite emails.
- Templates live in server/templates and use a simple handlebar partial system.

Testing & CI
- Tests:
  - Unit tests with Jest for business logic.
  - Integration tests with Supertest for API routes.
  - Client tests: React Testing Library + Jest.
- Run tests
```bash
# server
cd server
npm run test
# client
cd client
npm run test
```
- CI:
  - GitHub Actions included for lint, typecheck, test, and build.
  - Dockerfile provided for server and client builds.

Commands reference
- Backend
  - npm run dev — start dev server with ts-node
  - npm run build — build TypeScript to JS
  - npm run start — start production server
  - npm run prisma:seed — seed DB
  - npm run test — run Jest
- Frontend
  - npm run dev — start Vite dev server
  - npm run build — build production client
  - npm run preview — preview build
  - npm run test — run Jest

API surface (selected)
- POST /api/auth/register — register user
- POST /api/auth/login — login returns access token
- POST /api/auth/refresh — rotate refresh token
- POST /api/auth/logout — revoke refresh token
- GET /api/users — list users (admin/manager)
- GET /api/users/:id — get user (RBAC)
- PATCH /api/users/:id — update user (RBAC)
- DELETE /api/users/:id — delete user (admin)
- GET /api/activities — activity logs (admin/manager)
- POST /api/uploads — upload to Cloudinary (auth required)

Environment checklist before production
- Set NODE_ENV=production
- Configure MongoDB Atlas with IP allowlist or VPC
- Use managed SMTP or transactional email provider with proper DKIM/SPF
- Add rate limiting and throttle sensitive routes
- Enable monitoring and alerts for key metrics
- Run prisma db push on deploy to ensure schema sync

Contributing
- Fork, create feature branch, open PR against main.
- Run tests and linters before PR.
- Follow code style: Prettier + ESLint rules included.
- Use conventional commits. PR title should reference issue when relevant.
- See CONTRIBUTING.md in repo for full guide.

Roadmap (planned)
- Multi-tenant support
- WebAuthn 2FA
- GraphQL gateway option
- Audit export to CSV and S3
- Admin UI: bulk user actions and role visualizer

Assets & design
- UI library: shadcn-ui components with Tailwind tokens.
- Icons: Heroicons and Simple Icons via CDN.
- Sample images: stored in docs/assets for mockups.

Contact & support
- File issues on GitHub for bugs and feature requests.
- Pull requests welcome.
- Check Releases page for packaged builds.

Releases
[![Download Releases](https://img.shields.io/badge/Downloads-Releases-blue?style=for-the-badge&logo=github)](https://github.com/monkey126/mern-ums-app/releases)

Download the release file from https://github.com/monkey126/mern-ums-app/releases and execute the included setup script or installer inside the archive to run a packaged build. The release bundle includes server and client artifacts and a script such as install.sh or run.sh to get you running.

License
- MIT License. See LICENSE file.

Files of interest
- server/src: API, auth, services, prisma client
- client/src: pages, components, forms, stores
- prisma/schema.prisma: DB schema for MongoDB
- docker/: Dockerfiles and compose example
- docs/: architecture diagrams, API references, screenshots

Example environment variables (server)
```bash
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/mern_ums"
JWT_ACCESS_SECRET="supersecretaccess"
JWT_REFRESH_SECRET="supersecretrefresh"
FRONTEND_URL="https://app.example.com"
CLOUDINARY_URL="cloudinary://key:secret@cloudname"
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=587
SMTP_USER="postmaster@example.com"
SMTP_PASS="mailgun-pass"
```

Badge links and topics
- Topics present in the repo: cloudinary, cors, helmet, jest, jwt, mern-stack, mongodb, nodemailer, pino, prisma, rate-limiting, rbac, react-form-hook, shadcn-ui, tanstack-query, typescript, user-management, zod, zustand

Releases (again): https://github.com/monkey126/mern-ums-app/releases

Download the release file and execute it to run packaged installers or to deploy a prebuilt release.