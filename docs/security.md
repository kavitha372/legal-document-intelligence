# Security Documentation — Module 4: Cloud Security, Cryptography & Governance

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| Credential theft | bcrypt password hashing (cost factor 12); passwords never stored in plaintext |
| Token forgery | JWT signed with HS256 using a secret from environment variables |
| Expired token reuse | JWT expiry enforced server-side on every request |
| Privilege escalation | Role checked in middleware before every protected route |
| IDOR (insecure direct object reference) | Every record access verifies ownership at service layer |
| Malicious file upload | Extension, MIME type, and PDF magic bytes all validated; random UUID storage filename |
| Path traversal | Files stored in a dedicated dir; user-provided names never used in filesystem paths |
| SQL injection | All database operations use Prisma ORM with parameterised queries |
| Brute-force login | Rate limiter: max 10 login attempts per 15-minute window per IP |
| XSS | React's default JSX escaping; Helmet CSP headers |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` via Helmet |
| Secrets in source control | `.env` excluded from git; `.env.example` contains only placeholder values |
| Audit log tampering | Audit log is append-only; access restricted to admins |

## Authentication (Module 4)

- **Password hashing**: bcrypt with cost factor 12
- **Token type**: JSON Web Token (JWT), signed HS256
- **Token expiry**: 24 hours by default (configurable)
- **Logout**: client discards token; server records audit event
- **Timing attack prevention**: bcrypt comparison always runs even for unknown users

## Authorisation / RBAC

```
ADMIN         → all operations + user management + audit log access
LEGAL_REVIEWER → upload, search, ask, checklist, reviewer notes (own documents)
READ_ONLY     → view and search documents shared with them; no upload/delete
```

Role is embedded in the JWT and validated on every request by middleware. Users cannot change their own role.

## File Security

1. File extension validated (`.pdf` only)
2. MIME type validated (`application/pdf`)
3. PDF magic bytes checked (`%PDF-`)
4. File size limited (default 10 MB)
5. Page count limited (default 200 pages)
6. Storage filename = UUID v4 — original filename stored only as metadata
7. Uploads directory is outside the web root — files are never publicly accessible
8. Never execute uploaded content

## Audit Logging

Events recorded:
- Login success / failure
- Logout
- Document upload, delete, view
- Text extraction result
- Search and question actions (result count only — query text not logged)
- Checklist run and reviewer updates
- User creation / modification
- Admin audit log access
- Access denied events

Each log entry includes: actor (userId), action, entityType, entityId, outcome, requestId, timestamp.
**Sensitive data explicitly excluded**: passwords, tokens, full document text, question queries.

## Data at Rest

- SQLite database stored locally; access controlled by OS file permissions
- Uploaded files stored in the `uploads/` directory with UUID names
- Passwords stored only as bcrypt hashes
- JWT secret stored in environment variable — never in source code

## Known Limitations (Prototype)

- No TLS termination in local development (run behind a reverse proxy with TLS in any real deployment)
- SQLite is not recommended for multi-server or high-concurrency production use
- JWT tokens cannot be server-side invalidated before expiry (no token revocation store)
- The `uploads/` directory should be backed up independently in production
- This prototype does not implement full HSM or KMS key management
- Rate limiting is per-process; in a multi-instance deployment, use a shared Redis-backed rate limiter

## AWS Service Mapping (Conceptual — not configured)

| Local Prototype | AWS Equivalent |
|----------------|----------------|
| bcrypt + JWT | AWS Cognito + IAM |
| Prisma RBAC | IAM Roles + Resource Policies |
| Audit logs in SQLite | CloudTrail |
| Application logging (Winston) | CloudWatch Logs |
| Rate limiter (express-rate-limit) | WAF Rate Rules |
| File size + type validation | S3 Object Lambda / Macie |
| Random UUID filenames | S3 Server-Side Encryption + KMS |
| Docker secrets / .env | AWS Secrets Manager / Parameter Store |
| Dockerfile / Docker Compose | ECS / EKS / Fargate |
| Threat detection rules | GuardDuty |
| VPC isolation | Docker network isolation |
