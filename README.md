# Drisu Compliance Operations Portal

Subtitle: **An End-to-End Client, Case, Document and Compliance Management Platform**

---

## 1. Project Overview & Problem Statement

Compliance operations businesses manage multiple regulatory certifications (e.g., ISO 9001, ISO 14001, EPR Registration, GST Filings, Factory Licenses). Historically, tracking prospect leads, client profiles, required document checklists, review feedback, payments, and annual renewal deadlines has been fragmented across spreadsheets, emails, and messaging applications.

The **Drisu Compliance Operations Portal** centralizes these operations into a unified full-stack web application. It connects two distinct experiences backed by a single Node.js Express server and PostgreSQL database:
1. **Staff / Admin Operations Portal**: Operations dashboard, lead Kanban pipeline, transactional lead conversion, case assignment, document verification (approve/reject), payment recording, renewal tracking, and audit logging.
2. **Client Self-Service Portal**: Streamlined portal allowing clients to view their active compliance cases, upload required documents, view staff updates, check payment history, and track upcoming renewals.

---

## 2. Technology Stack

This application is built **100% in pure JavaScript** across frontend, backend, database scripts, and test suites.

- **Frontend**: React 18, JavaScript (`.js` & `.jsx`), Vite, React Router v6, Tailwind CSS, Lucide React, Recharts, React Hook Form, Zod.
- **Backend**: Node.js, Express (`.js`), JWT (`jsonwebtoken`), `bcryptjs`, `multer`, `helmet`, `cors`.
- **Database ORM**: PostgreSQL via Prisma ORM (`prisma-client-js`).
- **Authentication**: JWT Bearer token authentication with Role-Based Access Control (RBAC).

---

## 3. Database Architecture & Models

```
User (1) ───────────< Client (0..1)
  │                      │
  ├───────────────< Case (1..*)
  │                   ├───< CaseDocument (0..*)
  │                   ├───< Payment (0..*)
  │                   ├───< CaseComment (0..*)
  │                   ├───< ActivityLog (0..*)
  │                   └───< Renewal (0..*)
  └───────────────< Lead (0..*)
```

### Models Summary
- **`User`**: Admin, Manager, Staff, and Client login accounts.
- **`Lead`**: Sales prospect pipeline (`NEW`, `CONTACTED`, `PROPOSAL`, `WON`, `LOST`).
- **`Client`**: Corporate client records with GSTIN, PAN, and address details.
- **`Service`**: Compliance service catalog and document checklist templates.
- **`DocumentChecklistItem`**: Template requirements per service.
- **`Case`**: Compliance file linking Client & Service with financial metrics and workflow status.
- **`CaseDocument`**: Uploaded file metadata, storage paths, and review status.
- **`Payment`**: Payment ledger records (`Total Fee - Total Paid = Outstanding`).
- **`Renewal`**: Renewal status tracking (`ACTIVE`, `EXPIRING_SOON`, `RENEWAL_DUE`, `EXPIRED`).
- **`CaseComment`**: Internal staff notes vs client-visible updates.
- **`ActivityLog`**: System audit trail logs.
- **`Notification`**: Database-backed user notifications.

---

## 4. Setup & Running Instructions

### Step 1: Install Dependencies
```bash
# Install root dependencies
npm install

# Install server & client dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Step 2: Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/drisu_compliance_db?schema=public"
JWT_SECRET="drisu_compliance_operations_portal_jwt_secret_key_2026_secure"
JWT_EXPIRES_IN="1d"
UPLOAD_DIR="./uploads/documents"
```

### Step 3: Database Push & Seed Data
```bash
# Generate Prisma Client & push schema to PostgreSQL
npm run prisma:generate
npm run prisma:push

# Seed database with realistic demo accounts & compliance cases
npm run seed
```

### Step 4: Run Application
```bash
# Run backend (port 5000) and frontend (port 5173) concurrently
npm run dev
```

### Step 5: Run Automated Integration Tests
```bash
npm test
```

---

## 5. Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@drisu-demo.local` | `Demo@123456` |
| **Manager** | `manager@drisu-demo.local` | `Demo@123456` |
| **Staff** | `staff1@drisu-demo.local` | `Demo@123456` |
| **Client** | `client1@drisu-demo.local` | `Demo@123456` |

---

## 6. Viva Questions & Answers

### Frontend (React & JavaScript)
- **Q: Why React?**
  *A: React provides a declarative, component-based UI architecture with efficient virtual DOM reconciliation, making complex dashboards responsive and modular.*
- **Q: What is state in React?**
  *A: State is dynamic data held within a component that dictates its rendered output. When state updates via `useState`, React re-renders the component.*
- **Q: How does the frontend communicate with the backend?**
  *A: Via asynchronous HTTP REST API calls using `fetch` wrapped with Bearer JWT headers in `client/src/services/api.js`.*

### Backend (Node.js & Express)
- **Q: Why Node.js and Express?**
  *A: Node.js provides a high-throughput event-driven non-blocking I/O runtime. Express provides lightweight routing, middleware pipelines, and REST API controller organization.*
- **Q: What is middleware in Express?**
  *A: Middleware functions execute sequentially during the HTTP request-response cycle, handling tasks such as JWT authentication (`authMiddleware.js`), RBAC role authorization, client data isolation, and error handling.*

### Database (PostgreSQL & Prisma)
- **Q: Why PostgreSQL and Prisma ORM?**
  *A: PostgreSQL is a robust, ACID-compliant relational database. Prisma ORM provides type-safe query generation, schema migrations, and clean relational modelling in JavaScript.*
- **Q: How is lead conversion handled safely?**
  *A: Using database transactions (`prisma.$transaction`), ensuring that Client creation, Lead linking, status updates, and audit logs succeed atomically or roll back completely on failure.*

### Security & Data Isolation
- **Q: How is client data isolated?**
  *A: Client isolation happens strictly on the backend (`clientIsolationMiddleware.js`). When a user has the `CLIENT` role, the server queries their linked Client ID from the DB and scopes all queries by `clientId`. Client-supplied IDs are never trusted.*
- **Q: How are file uploads validated?**
  *A: `uploadMiddleware.js` uses `multer` to enforce maximum file size (15MB), whitelist allowed MIME types/extensions, and generate safe hashed filenames to prevent path traversal.*
