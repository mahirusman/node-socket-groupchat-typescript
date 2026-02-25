# Node + TypeScript backend with real-time chat APIs (Socket.IO), cleans legacy modules, and adds env/husky/docs setup.

## 1. Project Overview

This project is a TypeScript-based backend API built with Express, MongoDB (Mongoose), and Socket.IO.

It provides:

- User authentication endpoints (`signup`, `login`)
- Real-time 1:1 chat features using chat heads and messages
- JWT-protected REST APIs for chat operations
- Socket.IO authentication for real-time events
- Centralized error handling middleware for consistent API errors

### Problem it solves

It gives a reusable backend foundation for applications that need both:

- standard REST auth/data APIs, and
- real-time chat delivery with unread/seen state tracking.

### Tech stack

- Node.js
- TypeScript
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT (`jsonwebtoken`)
- `bcryptjs`
- `cors`, `morgan`, `dotenv`

---

## 2. Project Structure

### Full tree

```text
.
├── .env.dev
├── .env.stg
├── .env.prod
├── .gitignore
├── README.md
├── app.ts
├── server.ts
├── socket.ts
├── tsconfig.json
├── types.d.ts
├── package.json
├── package-lock.json
├── config/
│   └── env-config.ts
├── constants/
│   ├── chat-heads-messages.ts
│   └── message-messages.ts
├── controllers/
│   ├── user-controller.ts
│   ├── chat-heads-controller.ts
│   └── message-controller.ts
├── middlewares/
│   ├── chat-heads-middleware.ts
│   ├── message-middleware.ts
│   └── types/
│       └── file-upload-middleware.ts
├── models/
│   ├── user-model.ts
│   ├── chat-head-model.ts
│   ├── message-model.ts
│   └── types/
│       ├── model.ts
│       ├── user-model.ts
│       ├── chat-head-model.ts
│       └── message-model.ts
├── routes/
│   ├── user-routes.ts
│   ├── chat-heads-routes.ts
│   └── message-routes.ts
├── services/
│   ├── base-service.ts
│   ├── user-service.ts
│   └── types/
│       ├── service.ts
│       └── user-service.ts
└── utils/
    ├── app-error.ts
    ├── chat-helper.ts
    ├── cors.ts
    ├── error-controller.ts
    ├── general-functions.ts
    ├── index.ts
    ├── request-handler.ts
    ├── response-handler.ts
    ├── types/
    │   ├── index.ts
    │   └── response-handler-utils.ts
    └── email/
        ├── index.js
        ├── get-template.js
        └── views/
            ├── reset-password.hbs
            └── welcome.hbs
```

### File/folder descriptions

| Path | Description |
|---|---|
| `.env.dev` | Development environment variables template. |
| `.env.stg` | Staging environment variables template. |
| `.env.prod` | Production environment variables template. |
| `.gitignore` | Ignores `.env` and `node_modules`. |
| `README.md` | Project documentation. |
| `app.ts` | Express app setup, route mounting, 404 + global error middleware. |
| `server.ts` | HTTP server bootstrap, MongoDB connection, Socket.IO attach. |
| `socket.ts` | Socket.IO instance + JWT handshake validation middleware. |
| `tsconfig.json` | TypeScript compiler configuration. |
| `types.d.ts` | Global utility types used by request helpers. |
| `package.json` | Dependencies and npm scripts. |
| `package-lock.json` | Exact dependency lock file. |
| `config/env-config.ts` | Loads and normalizes environment variables. |
| `constants/chat-heads-messages.ts` | Chat-head response message constants. |
| `constants/message-messages.ts` | Message response message constants. |
| `controllers/user-controller.ts` | Signup/login request handling logic. |
| `controllers/chat-heads-controller.ts` | Chat-head CRUD/pin/list logic. |
| `controllers/message-controller.ts` | Message create/read/delete/seen/unread logic + socket emit. |
| `middlewares/chat-heads-middleware.ts` | Validation middleware for chat-head APIs. |
| `middlewares/message-middleware.ts` | Validation middleware for message APIs. |
| `middlewares/types/file-upload-middleware.ts` | Shared upload enum/type contracts. |
| `models/user-model.ts` | Mongoose User schema + password hashing hook. |
| `models/chat-head-model.ts` | Mongoose ChatHead schema. |
| `models/message-model.ts` | Mongoose Message schema. |
| `models/types/model.ts` | Generic model helper types. |
| `models/types/user-model.ts` | User model interfaces/types. |
| `models/types/chat-head-model.ts` | Chat-head model interfaces/types. |
| `models/types/message-model.ts` | Message model interfaces/types. |
| `routes/user-routes.ts` | Auth routes (`/signup`, `/login`). |
| `routes/chat-heads-routes.ts` | Chat-head routes. |
| `routes/message-routes.ts` | Message routes. |
| `services/base-service.ts` | Generic base data-access service wrapper. |
| `services/user-service.ts` | User-specific service extending base service. |
| `services/types/service.ts` | Generic service type contracts. |
| `services/types/user-service.ts` | User service input contracts. |
| `utils/app-error.ts` | Custom operational error class. |
| `utils/chat-helper.ts` | JWT auth helpers + chat response helper. |
| `utils/cors.ts` | CORS whitelist/pattern validation logic. |
| `utils/error-controller.ts` | Global error middleware (dev/prod behavior). |
| `utils/general-functions.ts` | Shared utility helpers (password encryption). |
| `utils/index.ts` | Generic util exports (`enumToArray`). |
| `utils/request-handler.ts` | Request filtering/required field validation helpers. |
| `utils/response-handler.ts` | Standardized success/error API response helper. |
| `utils/types/index.ts` | Shared utility-level type definitions. |
| `utils/types/response-handler-utils.ts` | Response status enum + response options contract. |
| `utils/email/index.js` | Nodemailer email sender utility. |
| `utils/email/get-template.js` | Email template loader/renderer. |
| `utils/email/views/reset-password.hbs` | Reset-password email template. |
| `utils/email/views/welcome.hbs` | Welcome email template. |

---

## 3. Prerequisites

Install the following before running locally:

- Node.js `>= 18.x` (recommended)
- npm `>= 8.x`
- MongoDB instance (local or remote)

Optional:

- Postman/Insomnia for API testing
- MongoDB Compass for DB inspection

---

## 4. Installation & Setup

### 4.1 Clone and install

```bash
git clone <your-repository-url>
cd node-setup-with-typescript
npm install
```

### 4.2 Environment setup

You can use one of the provided templates:

```bash
cp .env.dev .env
```

Required environment variables:

| Variable | Required | Description | Example |
|---|---|---|---|
| `MONGOURL` | Yes | MongoDB connection string | `mongodb://localhost:27017/node_setup_dev` |
| `JWT_SERCTET` | Yes | JWT secret (legacy key kept for compatibility) | `dev_jwt_secret` |
| `SECRETKEY` | Yes (recommended) | Primary JWT secret key used by chat auth helper | `dev_jwt_secret` |
| `JWT_EXPIRE_IN` | Yes | JWT expiry duration | `7d` |
| `PORT` | Yes | HTTP server port | `5000` |
| `CORS_WHITELIST` | Yes | Comma-separated allowed origins | `http://localhost:3000,http://localhost:5173` |
| `MAIL_EMAIL` | Optional | SMTP sender email | `noreply@example.com` |
| `MAIL_PASSWORD` | Optional | SMTP/app password | `your-app-password` |

### 4.3 Run locally

```bash
npm run dev
```

Default local URL:

- `http://localhost:5000`

---

## 5. Available Scripts

| Script | Command | What it does |
|---|---|---|
| `npm run dev` | `cp .env.dev .env && ts-node-dev ...` | Starts API in development mode with auto-reload. |
| `npm run start:dev` | `cp .env.dev .env && ts-node-dev ...` | Starts API using dev env template. |
| `npm run start:stg` | `cp .env.stg .env && ts-node-dev ...` | Starts API using staging env template. |
| `npm run start:prod` | `cp .env.prod .env && ts-node-dev ...` | Starts API using production env template. |
| `npm run typecheck` | `tsc --noEmit` | Runs TypeScript validation with no output files. |
| `npm run prepare` | `husky install` | Installs Husky Git hooks. Runs automatically after `npm install`. |

### Husky hooks (working)

Husky rules were copied and integrated from:

- `/Users/muhammadusman/Desktop/husky-practise`

Current hooks in this project are active and working:

- `.husky/pre-commit`
- `.husky/pre-push`
- `githooks_commands/pre-commit`
- `githooks_commands/pre-push`

Pre-commit enforces:

- no commits directly on protected branches (`main`, `master`)
- branch name must be ASCII only
- branch name must be lowercase
- TypeScript check (`npm run typecheck`)

Pre-push enforces:

- no pushes directly on protected branches (`main`, `master`)
- TypeScript check (`npm run typecheck`)

---

## 6. API Documentation

### Base URLs

- Auth: `/api/v1/auth`
- Chat Heads: `/chat-heads`
- Messages: `/messages`

### Authentication requirements

Chat-head and message APIs require header:

```http
Authorization: Bearer <jwt-token>
```

Token payload must include either:

- `userId` or
- `id`

> Note: current `login` endpoint returns user data, not a JWT token. If you call chat APIs, provide a valid JWT from your auth flow.

### 6.1 Auth endpoints

#### `POST /api/v1/auth/signup`
- Description: Registers a user.
- Also available as legacy alias: `POST /api/v1/auth/singup`

Request body:

```json
{
  "firstName": "Muhammad",
  "lastName": "Usman",
  "email": "usman@example.com",
  "password": "StrongPass123",
  "role": "customer"
}
```

Success response (200):

```json
{
  "success": true,
  "data": {
    "user": {}
  },
  "messages": ["User registered successfully"]
}
```

#### `POST /api/v1/auth/login`
- Description: Validates credentials.

Request body:

```json
{
  "email": "usman@example.com",
  "password": "StrongPass123"
}
```

Success response (200):

```json
{
  "success": true,
  "data": {
    "user": {}
  }
}
```

### 6.2 Chat-head endpoints

#### `GET /chat-heads`
- Description: Fetch pinned and unpinned chat heads for logged-in user.
- Query params (optional):
  - `chatId`: include a specific chat even without messages
  - `search`: participant name search

Response (200):

```json
{
  "status": 200,
  "success": true,
  "message": "Success",
  "data": {
    "pinHeads": [],
    "chatHeads": []
  }
}
```

#### `POST /chat-heads`
- Description: Create or fetch a 1:1 chat-head for a property.

Request body:

```json
{
  "propertyId": "65f0...",
  "propertyOwnerId": "65f1..."
}
```

#### `PUT /chat-heads/:chatHead`
- Description: Soft-delete chat head and related messages for current user.

#### `POST /chat-heads/pin/:chatHead`
- Description: Pin/unpin chat head.

Request body:

```json
{
  "status": true
}
```

### 6.3 Message endpoints

#### `POST /messages`
- Description: Create message and emit socket event to receiver.

Request body:

```json
{
  "chatHead": "65f2...",
  "body": "Hello",
  "medias": []
}
```

#### `GET /messages/get-message-count`
- Description: Returns unread message count for current user.

#### `GET /messages/:chatHead`
- Description: Returns messages grouped by date and marks them seen for current user.

#### `PUT /messages/:chatId`
- Description: Soft-delete a message for sender.

#### `POST /messages/seen-by/:message`
- Description: Marks one message as seen by current user.

---

## 7. Running in Production

### Current production command (as configured)

```bash
npm run start:prod
```

This loads `.env.prod` and starts the API.

### Build command

This repo currently uses runtime TypeScript execution (`ts-node-dev`) rather than a dedicated build pipeline.

Use this compile validation command before deployment:

```bash
npm run typecheck
```

### Deployment notes

- Set real production values in `.env.prod`
- Use `NODE_ENV=production`
- Place the process behind a reverse proxy (Nginx/Traefik)
- Use a process manager (PM2/systemd/container)
- Ensure MongoDB and CORS origin values are production-safe

---

## 8. GitHub Upload Guide

### 8.1 Initialize repository (if needed)

```bash
git init
```

### 8.2 Ensure `.gitignore`

Current `.gitignore` excludes:

- `.env`
- `node_modules`

If missing, add:

```gitignore
.env
node_modules
```

### 8.3 Commit code

```bash
git add .
git commit -m "Initial backend setup"
```

### 8.4 Connect to GitHub remote

```bash
git remote add origin https://github.com/<username>/<repo>.git
```

### 8.5 Push

```bash
git branch -M main
git push -u origin main
```

---

## 9. Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `MongoParseError: Invalid connection string ""` | `MONGOURL` missing/empty | Set `MONGOURL` in `.env` and restart. |
| `EADDRINUSE: address already in use` | Port already occupied | Change `PORT` or stop process using current port. |
| `Verification failed` / `Unauthorized` | Missing/invalid JWT in `Authorization` header | Send valid `Bearer <token>` with `userId`/`id` payload. |
| `Not allowed by CORS` | Request origin not in whitelist | Add frontend origin to `CORS_WHITELIST`. |
| Type errors on startup | Inconsistent TypeScript changes | Run `npm run typecheck` and resolve reported errors. |
| Duplicate email on signup | Existing user with same email | Use another email or log in. |

---

If you want, I can also generate an OpenAPI (Swagger) spec from the current routes/controllers so this README links to machine-readable API docs.
