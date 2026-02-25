# AGENT.md

## 1. Project Identity

### Project name

`node_authencation-ts`

### Purpose

This is a Node.js + TypeScript backend API that combines:

- authentication endpoints (`signup`, `login`), and
- real-time chat features (chat-heads + messages) backed by MongoDB and Socket.IO.

It solves the need for a reusable API foundation where users can authenticate and then send/receive chat messages with unread and seen state tracking.

### Tech stack (from `package.json`)

- Node.js runtime
- TypeScript `^4.5.4`
- Express `^4.17.2`
- Mongoose `^6.1.5`
- Socket.IO `^4.8.1`
- JWT: `jsonwebtoken` `^9.0.2`
- Password hashing: `bcryptjs` `^2.4.3`
- Config/loading: `dotenv` `^10.0.0`
- Request logging: `morgan` `^1.10.0`
- CORS: `cors` `^2.8.5`

### Entry point / boot process

There is **no root `index.ts`** in this repo. The runtime entry is:

- [`server.ts`](./server.ts)

Boot order:

1. `ENV_CONFIG` is imported (`config/env-config.ts`) and loads `.env`.
2. MongoDB connection starts via `mongoose.connect(...)`.
3. Express app from `app.ts` is mounted onto HTTP server.
4. Socket.IO server is attached to HTTP server.
5. Server listens on `ENV_CONFIG.port`.

---

## 2. Architecture & Request Flow

### Standard HTTP flow

`server.ts -> app.ts -> route -> middleware -> controller -> service (if used) -> model -> response`

### Actual flow by module

- **Auth flow**: route -> controller -> `UserService` -> `UserModel` -> `sendResponse`
- **Chat flow**: route -> middleware -> controller -> Mongoose models directly -> `sendApiResponse`

### `request-handler.ts`

File: [`utils/request-handler.ts`](./utils/request-handler.ts)

Exports:

- `filterParameters(requestBody, allowedParameters)`
- `requiredParametersProvided(requestBody, allowedParameters, optionalParameters)`

Use case:

- Normalizes incoming request body to allowed keys.
- Verifies required fields before controller logic.

### `response-handler.ts`

File: [`utils/response-handler.ts`](./utils/response-handler.ts)

Export:

- `sendResponse(options, res)`

Use case:

- Standard response structure for auth flows.
- Uses `ResponseStatusCodes` from `utils/types/response-handler-utils.ts`.

### `error-controller.ts` + `app-error.ts`

Files:

- [`utils/app-error.ts`](./utils/app-error.ts)
- [`utils/error-controller.ts`](./utils/error-controller.ts)

How they work together:

- `AppError` creates operational errors with `statusCode`, `status`, `isOperational`.
- `app.ts` sends unknown routes through `next(new AppError(..., 404))`.
- `globalErrorHandler` formats dev/prod errors and maps Mongo-specific errors:
  - CastError
  - Duplicate key
  - ValidationError

### `general-functions.ts`

File: [`utils/general-functions.ts`](./utils/general-functions.ts)

Export:

- `encrypt(passwordPlain)`

Current usage:

- Used by User pre-save hook in `models/user-model.ts` to hash passwords.

---

## 3. Chat Feature — Full Detail

### `chat-helper.ts` (every function)

File: [`utils/chat-helper.ts`](./utils/chat-helper.ts)

Exports:

1. `sendApiResponse(res, obj)`
- Chat-focused response wrapper with `{ status, success, message, errors, data }`.

2. `clearErrorMsg(msg)`
- Normalizes error text and rewrites password complexity message.

3. `verifyAccessToken(req, res, next)`
- Reads `Authorization` header.
- Supports `Bearer <token>` format.
- Verifies token with `ENV_CONFIG.jwtSecret`.
- Attaches decoded payload to `req.payload`.

4. `isValidToken(token)`
- Used for socket authentication.
- Accepts token from socket handshake sources.
- Returns decoded payload or `false`.

### Chat-head pipeline

Files:

- Model: [`models/chat-head-model.ts`](./models/chat-head-model.ts)
- Controller: [`controllers/chat-heads-controller.ts`](./controllers/chat-heads-controller.ts)
- Middleware: [`middlewares/chat-heads-middleware.ts`](./middlewares/chat-heads-middleware.ts)
- Routes: [`routes/chat-heads-routes.ts`](./routes/chat-heads-routes.ts)

Core behavior:

- Create/reuse chat-head per `propertyId` + two participants.
- Fetch pinned and unpinned chat-head lists.
- Aggregate unread count from `messages` collection.
- Soft-delete chat-head/messages for current user.
- Toggle pin status (`userPin`).

### Message pipeline

Files:

- Model: [`models/message-model.ts`](./models/message-model.ts)
- Controller: [`controllers/message-controller.ts`](./controllers/message-controller.ts)
- Middleware: [`middlewares/message-middleware.ts`](./middlewares/message-middleware.ts)
- Routes: [`routes/message-routes.ts`](./routes/message-routes.ts)

Core behavior:

- Create message for a `chatHead`.
- Resolve receiver from chat participants.
- Emit realtime event: ``${receiver}-message``.
- Read messages grouped by date.
- Mark messages as seen.
- Soft-delete a message by sender.
- Return unread count.

### Chat constants

- [`constants/chat-heads-messages.ts`](./constants/chat-heads-messages.ts)
- [`constants/message-messages.ts`](./constants/message-messages.ts)

Both contain:

- `SUCCESS`
- `SERVER_ERROR`
- `TYPE_ERROR`

Used to avoid repeating message literals across chat controllers.

### Full send-message flow

1. Client sends `POST /messages` with `chatHead`, `body`, optional `medias`.
2. `verifyAccessToken` validates JWT and attaches `req.payload`.
3. `validateCreateMessage` validates input shape.
4. `createMessage` resolves receiver and inserts message.
5. Socket event is emitted to receiver channel.
6. API returns created payload via `sendApiResponse`.

---

## 4. File-by-File Responsibility Map

| File | What it does | Exports | Imported by | Edit when |
|---|---|---|---|---|
| `app.ts` | Express app setup, routes, 404, global error middleware | `app` | `server.ts` | Adding global middleware/routes |
| `server.ts` | HTTP + Mongo + Socket.IO boot | runtime side-effects | process entry | Server startup behavior changes |
| `socket.ts` | Socket.IO server + token auth | `{ io }` | `server.ts`, `message-controller.ts` | Realtime auth/event changes |
| `config/env-config.ts` | Reads env and exposes normalized config | `ENV_CONFIG` | `server.ts`, `chat-helper.ts`, `cors.ts` | New env vars/config logic |
| `constants/chat-heads-messages.ts` | Chat-head text constants | `CHAT_HEADS_MESSAGES` | `chat-heads-controller.ts` | Changing chat-head messages |
| `constants/message-messages.ts` | Message text constants | `MESSAGE_MESSAGES` | `message-controller.ts` | Changing message texts |
| `controllers/user-controller.ts` | Signup/login business flow | default object `{signup, login}` | `routes/user-routes.ts` | Auth behavior changes |
| `controllers/chat-heads-controller.ts` | Chat-head endpoints logic | default controller instance | `routes/chat-heads-routes.ts` | Chat-head business changes |
| `controllers/message-controller.ts` | Message endpoints logic | default controller instance | `routes/message-routes.ts` | Message business changes |
| `middlewares/chat-heads-middleware.ts` | Chat-head request validation | `validateCreateChatHead`, `validateGetChatHeadMessages` | `chat-heads-routes.ts` | Chat-head validation updates |
| `middlewares/message-middleware.ts` | Message request validation | `validateCreateMessage`, `validateGetMessages` | `message-routes.ts` | Message validation updates |
| `middlewares/types/file-upload-middleware.ts` | Upload enums/types | enums + types | shared | Upload contract changes |
| `models/user-model.ts` | User Mongoose schema/model + pre-save hash | `UserModel` | `user-service.ts` | User DB schema changes |
| `models/chat-head-model.ts` | Chat-head schema/model | `ChatHeadModel` | chat controllers | Chat-head schema changes |
| `models/message-model.ts` | Message schema/model | `MessageModel` | chat controllers | Message schema changes |
| `models/types/model.ts` | Shared tiny model typing helper | `Props` | `user-model.ts` | Validation props typing changes |
| `models/types/user-model.ts` | User model interfaces/types | many types/enums | user model/service/controller | User typing changes |
| `models/types/chat-head-model.ts` | Chat-head model interfaces/types | type aliases/interfaces | chat-head model/controller | Chat-head typing changes |
| `models/types/message-model.ts` | Message model interfaces/types | type aliases/interfaces | message model/controller | Message typing changes |
| `routes/user-routes.ts` | Auth endpoint bindings | `router` | `app.ts` | Add/change auth endpoints |
| `routes/chat-heads-routes.ts` | Chat-head endpoint bindings | `router` | `app.ts` | Add/change chat-head routes |
| `routes/message-routes.ts` | Message endpoint bindings | `router` | `app.ts` | Add/change message routes |
| `services/base-service.ts` | Generic service data access methods | `BaseService` | `user-service.ts` | Shared service methods |
| `services/user-service.ts` | User data service | `UserService` | `user-controller.ts` | User DB operations |
| `services/types/service.ts` | Generic service contract types | types/enums | service layer | Common service type changes |
| `services/types/user-service.ts` | User service input contracts | interfaces | user service/controller | User service input changes |
| `utils/app-error.ts` | Custom operational error class | `AppError` | `app.ts`, `error-controller.ts` | Error object structure changes |
| `utils/error-controller.ts` | Global error middleware | `globalErrorHandler` | `app.ts` | Error formatting/handling updates |
| `utils/chat-helper.ts` | Chat auth + chat response helper | helper functions | chat controllers/routes/socket | JWT/chat helper changes |
| `utils/cors.ts` | CORS origin allowlist logic | `isOriginAllowed`, `corsOriginValidator` | `app.ts`, `server.ts` | CORS policy changes |
| `utils/general-functions.ts` | Shared cryptographic helper | `encrypt` | `user-model.ts` | Password hashing strategy |
| `utils/index.ts` | Utility helper(s) | `enumToArray` | `user-model.ts` | Enum helper behavior |
| `utils/request-handler.ts` | Request filtering/required checks | helpers | `user-controller.ts` | Request validation helper updates |
| `utils/response-handler.ts` | Standard response helper for auth flow | `sendResponse` | `user-controller.ts` | Response format changes |
| `utils/types/index.ts` | Shared utility-level types | interface/enum | internal utils | Utility type changes |
| `utils/types/response-handler-utils.ts` | Response status codes + options | enum/interface | `response-handler.ts`, auth controller | Response typing changes |
| `utils/email/index.js` | SMTP sender wrapper | `sendEmail` | (currently not wired in controllers) | Email sending logic |
| `utils/email/get-template.js` | Handlebars template resolver | `prepareTemplate` | `utils/email/index.js` | Template selection logic |
| `utils/email/views/reset-password.hbs` | Reset password template HTML | template file | get-template | Email template content |
| `utils/email/views/welcome.hbs` | Welcome template HTML | template file | future usage | Welcome email content |
| `.env.dev` | Dev environment values | env vars | runtime | Dev config updates |
| `.env.stg` | Staging environment values | env vars | runtime | Staging config updates |
| `.env.prod` | Production environment values | env vars | runtime | Production config updates |
| `.gitignore` | Ignore rules | ignore entries | git | New generated/sensitive files |
| `types.d.ts` | Global typing aliases | global types | utils request helpers | Global request type changes |
| `tsconfig.json` | TS compiler config | config | build/typecheck | Compiler behavior changes |
| `package.json` | Scripts + dependencies | npm metadata | npm/runtime | Dependencies/scripts changes |
| `package-lock.json` | Dependency lock state | lock metadata | npm | Dependency reproducibility |

---

## 5. Types System

### `middlewares/types/`

File: `middlewares/types/file-upload-middleware.ts`

Contains:

- `FileNameEnum`
- `UploadDirectoryEnum`
- `RequestUploadData`
- `RequestUpload`

Purpose:

- Defines upload naming and directory contracts.

### `models/types/`

- `model.ts`
  - `Props`
- `user-model.ts`
  - `Roles`, `IUser`, `IUserMethods`, `IUserDocument`, `UserModelType`, `CreateUserInput`
- `chat-head-model.ts`
  - `IChatHead`, `ChatHeadDocument`, `ChatHeadModelType`, `CreateChatHeadInput`
- `message-model.ts`
  - `IMedia`, `IMessage`, `MessageDocument`, `MessageModelType`, `CreateMessageInput`

### `services/types/`

- `service.ts`
  - `Update`, `Retrieve`, `Criteria`, `MongoErrorCodeNames`, `DeleteResponse`
- `user-service.ts`
  - `InputDataCreate`, `InputDataUpdatePhone`

### root `types.d.ts`

Global aliases used by request helper utilities:

- `RequestBody`
- `AllowedParameters`

---

## 6. Models & Database Schema

### `user-model.ts`

Collection/model: `User`

Fields:

- `email: string` (required, unique, validated by `validator.isEmail`)
- `emailVerified: boolean` (default `false`)
- `phone?: string` (unique + sparse, validated by `validator.isMobilePhone`)
- `phoneVerified: boolean` (default `false`)
- `firstName: string` (required)
- `lastName: string` (required)
- `password: string` (required)
- `role?: string` (enum from `Roles`)

Computed/behavior:

- virtual `nickName`
- pre-save hook hashes password with `encrypt(...)`

Indexes/constraints:

- Unique index on `email`
- Unique sparse index on `phone`

### `chat-head-model.ts`

Collection: `chat_heads`

Fields:

- `propertyId: ObjectId` (ref `listings`, required)
- `participant: ObjectId[]` (ref `User`, required)
- `deletedByUsers: ObjectId[]` (ref `User`)
- `lastMessage?: string`
- `userPin: ObjectId[]` (ref `User`)
- `userMute: ObjectId[]` (ref `User`)

### `message-model.ts`

Collection: `messages`

Fields:

- `chatHead: ObjectId` (ref `ChatHead`, required)
- `sentBy: ObjectId` (ref `User`, required)
- `receivedBy: ObjectId` (ref `User`, required)
- `medias: { name, ext, size, url }[]`
- `body?: string`
- `deletedByUsers: ObjectId[]` (ref `User`, default `[]`)
- `seenBy: ObjectId[]` (ref `User`, default `[]`)

### Model relationships

- `Message.chatHead -> ChatHead`
- `Message.sentBy -> User`
- `Message.receivedBy -> User`
- `ChatHead.participant -> User[]`

---

## 7. Services Layer

### `base-service.ts`

Provides generic reusable methods:

- `getOne`
- `getMany`
- `getOneById`
- `count`
- `aggregate`
- `deleteOne`
- `deleteMany`
- `updateOne`
- `updateMany`

### `user-service.ts`

Extends `BaseService<IUserDocument>` and adds user-specific `create` logic.

### Pattern for new services

1. Create `services/<feature>-service.ts`
2. Extend `BaseService<YourDocumentType>`
3. Use your model in constructor: `super(YourModel)`
4. Add feature-specific methods in service only
5. Keep controllers thin and delegate work to service

---

## 8. Middleware Layer

### What each middleware does

- `validateCreateChatHead`
  - Requires `propertyId`, `propertyOwnerId`
- `validateGetChatHeadMessages`
  - pass-through placeholder
- `validateCreateMessage`
  - Requires `chatHead`
  - Enforces `body` is string if present
  - Enforces `medias` is array if present
- `validateGetMessages`
  - pass-through placeholder
- `verifyAccessToken` (from `chat-helper.ts`)
  - Validates JWT
  - Attaches decoded payload to `req.payload`

### Execution order

For protected endpoints:

1. Route-level auth middleware (`verifyAccessToken`)
2. Route-level validator middleware
3. Controller handler
4. Response helper
5. Global error middleware (if `next(err)` is used)

---

## 9. Environment Variables

Read from:

- `.env.dev`
- `.env.stg`
- `.env.prod`

Access pattern:

- Always via `ENV_CONFIG` (`config/env-config.ts`)

### Variables

| Variable | Required | Purpose | Dev | Stg | Prod |
|---|---|---|---|---|---|
| `MONGOURL` | Yes | MongoDB connection string | `node_setup_dev` DB | `node_setup_stg` DB | `node_setup_prod` DB |
| `JWT_SERCTET` | Yes (compat) | JWT secret fallback | `dev_jwt_secret` | `stg_jwt_secret` | `prod_jwt_secret` |
| `SECRETKEY` | Yes | primary JWT secret | `dev_jwt_secret` | `stg_jwt_secret` | `prod_jwt_secret` |
| `JWT_EXPIRE_IN` | Yes | token expiry string | `7d` | `7d` | `7d` |
| `PORT` | Yes | HTTP server port | `5000` | `5001` | `5002` |
| `CORS_WHITELIST` | Yes | allowed origins list | localhost origins | staging domain | prod domain |
| `MAIL_EMAIL` | Optional | SMTP sender email | empty template | empty template | empty template |
| `MAIL_PASSWORD` | Optional | SMTP password/app key | empty template | empty template | empty template |

Required for startup:

- `MONGOURL`
- One of `SECRETKEY` or `JWT_SERCTET` (project expects secret)
- `PORT`

---

## 10. Email Module

Location:

- `utils/email/`

Files:

- `index.js`: sends email via nodemailer (Gmail service)
- `get-template.js`: picks and compiles handlebars templates
- `views/reset-password.hbs`: reset template
- `views/welcome.hbs`: welcome template

Current status:

- Module exists and is reusable.
- No controller currently invokes `sendEmail` directly.

---

## 11. CORS & Security

### CORS

File: `utils/cors.ts`

- Reads comma-separated origins from `ENV_CONFIG.corsWhitelist`
- Also allows regex pattern: `*.hutfin.com`
- Used in both Express and Socket.IO setup

### JWT security

- HTTP auth middleware: `verifyAccessToken`
- Socket auth middleware: `isValidToken` + handshake extraction
- Token can be passed as:
  - socket auth token
  - authorization header
  - query token

---

## 12. Naming Conventions Used in This Project

- File naming: `kebab-case.ts`
- Variables/functions: `camelCase`
- Classes/interfaces/types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Route path pattern: kebab-style for multi-word segments (`/chat-heads`, `/seen-by`)
- Model field naming: `camelCase`

---

## 13. How to Add a New Feature (Checklist)

1. Add model type definitions in `models/types/<feature>-model.ts`
2. Add Mongoose model in `models/<feature>-model.ts`
3. Add service types in `services/types/<feature>-service.ts`
4. Add service class in `services/<feature>-service.ts` (extend `BaseService`)
5. Add request validation middleware in `middlewares/<feature>-middleware.ts`
6. Add controller in `controllers/<feature>-controller.ts`
7. Add route bindings in `routes/<feature>-routes.ts`
8. Add message constants in `constants/<feature>-messages.ts`
9. Mount route in `app.ts`
10. Add/update env vars in `.env.dev`, `.env.stg`, `.env.prod` and `env-config.ts`
11. Add/update docs in `README.md` and `AGENT.md`
12. Run `npm run typecheck`

Never forget for new endpoint:

- auth requirements (`verifyAccessToken`) if needed
- middleware validation before controller
- consistent response shape using helpers
- error path behavior with `AppError` + global handler

---

## 14. Scripts & Commands

From `package.json`:

- `npm run dev`
  - copies `.env.dev` to `.env`
  - starts `ts-node-dev` on `server.ts`

- `npm run start:dev`
  - same as `dev`

- `npm run start:stg`
  - copies `.env.stg` and starts server

- `npm run start:prod`
  - copies `.env.prod` and starts server

- `npm run typecheck`
  - runs TypeScript compile validation: `tsc --noEmit`

- `npm run prepare`
  - installs Husky Git hooks

Build/compile note:

- No dedicated JS build script currently exists.
- Use `npm run typecheck` as compile gate.

Husky integration status:

- Husky is integrated and working in this project.
- Hook rules were copied from `/Users/muhammadusman/Desktop/husky-practise`.
- Active hook files:
  - `.husky/pre-commit`
  - `.husky/pre-push`
  - `githooks_commands/pre-commit`
  - `githooks_commands/pre-push`
- Pre-commit and pre-push enforce branch protection and `npm run typecheck`.

---

## 15. Rules for Any AI Working on This Project

- Always use `kebab-case` for file names.
- Always keep variables/functions in `camelCase`.
- Always keep classes/interfaces/types in `PascalCase`.
- Always keep constants in `UPPER_SNAKE_CASE`.
- Always extend `BaseService` for new services.
- Always keep controllers thin and service-driven.
- Always validate request input in middleware.
- Always use `ENV_CONFIG` instead of raw `process.env` in app code.
- Always add new env vars to all three env templates.
- Always update `AGENT.md` when structure/patterns change.
- Always keep Husky hooks enabled and executable.
- Never bypass pre-commit/pre-push checks in normal workflow.

---

## 16. Known Patterns & Gotchas

- There are two response helpers:
  - `sendResponse` (auth module)
  - `sendApiResponse` (chat module)
  Keep this in mind when maintaining consistent API contracts.

- `login` currently returns user data, not JWT token.
  Chat endpoints still require a valid Bearer token.

- Chat controllers currently include direct model queries and aggregations.
  This is functional but differs from strict service-only architecture.

- Chat flow mixes aggregation and `populate` in create/fetch paths.
  Avoid breaking user resolution logic in `createMessage` and `createChatHead`.

- `verifyAccessToken` expects header name `authorization` and supports `Bearer ...`.

- `globalErrorHandler` is mounted, but many controllers catch and respond directly.
  Throwing/forwarding errors with `next()` enables centralized formatting.

- Husky hooks are part of the development contract in this repo and currently working.
  Do not remove branch protection or typecheck checks from hooks.

---

## RULES — EVERY AI AND DEVELOPER MUST FOLLOW THESE WITHOUT EXCEPTION

### General Project Rules

- Always use `kebab-case` for ALL file names.
- Always use `camelCase` for variables and function names.
- Always use `PascalCase` for classes, interfaces, and types.
- Always use `UPPER_SNAKE_CASE` for constants.
- Never hardcode any string; place reusable strings in `constants/`.
- Never hardcode any shared numeric configuration; use named constants.
- Never write business logic inside routes.
- Controllers should orchestrate, services should own business/data operations.
- Never write ad-hoc database query logic in routes.
- Keep functions small and single-responsibility.
- Avoid `any`; define explicit interfaces/types.
- Add types in the nearest `types/` folder for that layer.
- Do not define complex inline types in signatures if they can be reused.
- Avoid `console.log` in production paths; use structured logging policy.
- Use `async/await` consistently.
- Wrap async controller logic in `try/catch`.
- Use `AppError` for operational error creation.
- Prefer request helper + response helper patterns consistently.
- Extend `BaseService` for new services.
- Add new env vars to `.env.dev`, `.env.stg`, `.env.prod` and `env-config.ts`.
- Never read raw `process.env.*` in business modules; use `ENV_CONFIG`.
- Validate request input in middleware.
- Keep middleware in `middlewares/`, not inline in route declarations.
- Never commit live secret `.env` files.
- Update this `AGENT.md` when adding/changing architecture.
- Always keep Husky hook rules aligned with team branch policy.

### MongoDB Rules — Strict

- Prefer MongoDB Aggregation Pipeline for cross-collection joins and projections.
- Prefer `$lookup` over heavy nested query patterns when joining collections.
- Keep `$match` as early as possible in aggregation pipelines.
- For pagination-heavy endpoints, prefer aggregation with `$facet` (data + total count).
- Avoid memory pagination (`array.slice`) for database-backed lists.
- Keep schema relationships explicit via ObjectId refs.
