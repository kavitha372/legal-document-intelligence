import { Router } from 'express';
import { authenticate, requireAdmin, requireReviewer } from '../middleware/auth';
import * as auth from '../controllers/authController';
import * as docs from '../controllers/documentController';

const router = Router();

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Sign in — returns a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: reviewer1
 *               password:
 *                 type: string
 *                 example: Reviewer@1234!
 *     responses:
 *       200:
 *         description: Login successful — JWT token returned
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', auth.login);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user account (assigned READ_ONLY role)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: MyP@ss1234
 *     responses:
 *       201:
 *         description: Account created — JWT token returned
 *       409:
 *         description: Username or email already in use
 */
router.post('/auth/register', auth.register);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout and record audit event
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Authentication required
 */
router.post('/auth/logout', authenticate, auth.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Authentication required
 */
router.get('/auth/me', authenticate, auth.getMe);

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

/**
 * @openapi
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics and recent activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Document counts, recent documents, recent activity
 *       401:
 *         description: Authentication required
 */
router.get('/dashboard/stats', authenticate, docs.getDashboardStats);

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

/**
 * @openapi
 * /documents:
 *   post:
 *     summary: Upload a PDF and extract its text (Reviewer / Admin only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, title]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *                 example: Service Agreement 2024
 *               description:
 *                 type: string
 *                 example: Annual IT services contract
 *     responses:
 *       201:
 *         description: Document uploaded and text extracted
 *       400:
 *         description: Invalid file or missing fields
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Reviewer or Admin role required
 */
router.post('/documents', authenticate, requireReviewer, docs.uploadDocument);

/**
 * @openapi
 * /documents:
 *   get:
 *     summary: List all accessible documents (paginated)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, EXTRACTED, OCR_REQUIRED, FAILED]
 *     responses:
 *       200:
 *         description: Paginated list of documents
 *       401:
 *         description: Authentication required
 */
router.get('/documents', authenticate, docs.listDocuments);

/**
 * @openapi
 * /documents/{id}:
 *   get:
 *     summary: Get a single document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document metadata
 *       403:
 *         description: Access denied (IDOR protection)
 *       404:
 *         description: Document not found
 */
router.get('/documents/:id', authenticate, docs.getDocument);

/**
 * @openapi
 * /documents/{id}/pages:
 *   get:
 *     summary: Get all extracted pages for a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of extracted page objects with page numbers and text
 *       403:
 *         description: Access denied
 *       404:
 *         description: Document not found
 */
router.get('/documents/:id/pages', authenticate, docs.getDocumentPages);

/**
 * @openapi
 * /documents/{id}/status:
 *   get:
 *     summary: Get extraction and review status of a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Extraction status and review status
 *       404:
 *         description: Document not found
 */
router.get('/documents/:id/status', authenticate, docs.getDocumentStatus);

/**
 * @openapi
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document and its file (Owner / Admin only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 *       403:
 *         description: Access denied
 *       404:
 *         description: Document not found
 */
router.delete('/documents/:id', authenticate, requireReviewer, docs.deleteDocument);

// ---------------------------------------------------------------------------
// Search & Q&A
// ---------------------------------------------------------------------------

/**
 * @openapi
 * /documents/{id}/search:
 *   get:
 *     summary: Keyword search within a document (TF-IDF ranked)
 *     tags: [Search & Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: termination
 *     responses:
 *       200:
 *         description: Ranked search results with page numbers and matched terms
 *       400:
 *         description: Query parameter q is required
 *       403:
 *         description: Access denied
 */
router.get('/documents/:id/search', authenticate, docs.searchDocumentHandler);

/**
 * @openapi
 * /documents/{id}/ask:
 *   post:
 *     summary: Ask a plain-English question — returns evidence-grounded answer
 *     tags: [Search & Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *                 example: What is the termination notice period?
 *     responses:
 *       200:
 *         description: Answer with evidence passages and page citations
 *       400:
 *         description: Question is required
 *       403:
 *         description: Access denied
 */
router.post('/documents/:id/ask', authenticate, docs.askQuestion);

// ---------------------------------------------------------------------------
// Checklist
// ---------------------------------------------------------------------------

/**
 * @openapi
 * /documents/{id}/checklist:
 *   post:
 *     summary: Run compliance checklist analysis (Reviewer / Admin only)
 *     tags: [Checklist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Checklist results — FOUND / NOT_DETECTED / NEEDS_REVIEW per item
 *       403:
 *         description: Reviewer or Admin role required
 *       404:
 *         description: Document not found
 */
router.post('/documents/:id/checklist', authenticate, requireReviewer, docs.runChecklistHandler);

/**
 * @openapi
 * /documents/{id}/checklist:
 *   get:
 *     summary: Get saved checklist results for a document
 *     tags: [Checklist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of checklist items with detection status and reviewer notes
 *       403:
 *         description: Access denied
 *       404:
 *         description: Document not found
 */
router.get('/documents/:id/checklist', authenticate, docs.getChecklistResults);

/**
 * @openapi
 * /documents/{id}/checklist/{itemId}:
 *   patch:
 *     summary: Update reviewer notes or status on a checklist item (Reviewer / Admin only)
 *     tags: [Checklist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewerNotes:
 *                 type: string
 *                 example: Confirmed — see clause 8.2
 *               detectionStatus:
 *                 type: string
 *                 enum: [FOUND, NOT_DETECTED, NEEDS_REVIEW]
 *     responses:
 *       200:
 *         description: Checklist item updated
 *       403:
 *         description: Reviewer or Admin role required
 *       404:
 *         description: Item not found
 */
router.patch('/documents/:id/checklist/:itemId', authenticate, requireReviewer, docs.updateChecklistItem);

// ---------------------------------------------------------------------------
// Administration (Admin only)
// ---------------------------------------------------------------------------

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List all user accounts (Admin only)
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of all user accounts
 *       403:
 *         description: Admin role required
 */
router.get('/admin/users', authenticate, requireAdmin, auth.listUsers);

/**
 * @openapi
 * /admin/users:
 *   post:
 *     summary: Create a new user account (Admin only)
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, role]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, LEGAL_REVIEWER, READ_ONLY]
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Username or email already exists
 */
router.post('/admin/users', authenticate, requireAdmin, auth.createUser);

/**
 * @openapi
 * /admin/users/{id}:
 *   patch:
 *     summary: Update a user's role or active status (Admin only)
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, LEGAL_REVIEWER, READ_ONLY]
 *               isActive:
 *                 type: boolean
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 */
router.patch('/admin/users/:id', authenticate, requireAdmin, auth.updateUser);

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     summary: View paginated audit logs (Admin only)
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Paginated audit log entries
 *       403:
 *         description: Admin role required
 */
router.get('/admin/audit-logs', authenticate, requireAdmin, auth.getAuditLogs);

export default router;
