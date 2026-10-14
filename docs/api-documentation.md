# API Documentation

Full interactive documentation is available at **http://localhost:3001/api/docs** when the backend is running (Swagger UI).

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Obtain a token by calling `POST /auth/login`.

---

## Endpoints

### System
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Service health check |

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | None | Login, returns JWT token |
| POST | `/auth/logout` | Required | Logout, records audit event |
| GET | `/auth/me` | Required | Get current user profile |

### Dashboard
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard/stats` | Required | Document counts and recent activity |

### Documents
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/documents` | Required | REVIEWER/ADMIN | Upload and extract a PDF |
| GET | `/documents` | Required | Any | List accessible documents |
| GET | `/documents/:id` | Required | Owner/Admin | Get document metadata |
| GET | `/documents/:id/pages` | Required | Owner/Admin | Get all extracted pages |
| GET | `/documents/:id/status` | Required | Owner/Admin | Get extraction/review status |
| DELETE | `/documents/:id` | Required | Owner/Admin | Delete document and file |

### Search & Q&A
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/documents/:id/search?q=` | Required | Keyword search within document |
| POST | `/documents/:id/ask` | Required | Evidence-grounded question answering |

**POST /documents/:id/ask request body:**
```json
{ "question": "What is the termination notice period?" }
```

**POST /documents/:id/ask response:**
```json
{
  "success": true,
  "data": {
    "question": "What is the termination notice period?",
    "answer": "Based on the document...",
    "evidence": [
      { "pageNumber": 4, "text": "...", "relevanceScore": 6, "matchedTerms": ["termination"] }
    ],
    "hasEvidence": true,
    "retrievalMethod": "keyword-tfidf",
    "documentId": "...",
    "disclaimer": "This application provides document search and preliminary checklist assistance only..."
  }
}
```

### Checklist
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/documents/:id/checklist` | Required | REVIEWER/ADMIN | Run checklist analysis |
| GET | `/documents/:id/checklist` | Required | Owner/Admin | Get saved checklist results |
| PATCH | `/documents/:id/checklist/:itemId` | Required | REVIEWER/ADMIN | Update reviewer notes/status |

### Administration (ADMIN only)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | ADMIN | List all users |
| POST | `/admin/users` | ADMIN | Create user account |
| PATCH | `/admin/users/:id` | ADMIN | Update user role/status |
| GET | `/admin/audit-logs` | ADMIN | View audit records |

---

## Common Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

## Error Response Format
```json
{
  "success": false,
  "error": "Human-readable error message",
  "requestId": "req_1234567890_abc123"
}
```

## HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Authentication required or invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate username) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
