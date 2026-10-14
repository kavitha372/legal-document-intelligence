# AWS Concept Mapping

## Important Disclaimer

This project runs **entirely locally**. No AWS services have been configured, deployed, or billed.
The table below maps **local implementation concepts** to the equivalent AWS services to demonstrate
understanding of cloud-native architecture patterns.

This distinction is important for assessment purposes: local equivalents demonstrate the **concept**,
not the actual AWS service.

---

## Module 1 — Cloud Product & Platform Engineering

| Local Implementation | AWS Equivalent | Notes |
|---------------------|----------------|-------|
| Node.js + Express app | AWS Lambda + API Gateway, or EC2 | Serverless or containerised compute |
| Docker Compose | AWS ECS (Elastic Container Service) | Container orchestration |
| Docker image | Amazon ECR | Container registry |
| Vite SPA (static files) | S3 + CloudFront | Static hosting + CDN |
| nginx (Docker) | Application Load Balancer | Load balancing + routing |
| GitHub Actions CI | AWS CodePipeline + CodeBuild | CI/CD automation |
| Health endpoint `/api/health` | CloudWatch Health Checks | Service monitoring |
| `.env` configuration | AWS Systems Manager Parameter Store | Centralised config |

---

## Module 2 — Data Engineering, Big Data & ML Insights

| Local Implementation | AWS Equivalent | Notes |
|---------------------|----------------|-------|
| PDF extraction pipeline | AWS Glue ETL Job | Managed ETL service |
| pdfjs-dist (text extraction) | Amazon Textract | AI-powered document extraction |
| SQLite + Prisma | Amazon RDS (PostgreSQL) or DynamoDB | Managed relational/NoSQL database |
| File uploads directory | Amazon S3 | Object storage |
| Keyword + TF-IDF search | Amazon Kendra or OpenSearch | Enterprise document search |
| Rule-based checklist | AWS Step Functions + Lambda | Managed workflow / rules engine |
| Dashboard statistics | Amazon QuickSight | Business intelligence dashboards |
| Data pipeline (ETL) | AWS Glue + Amazon S3 Data Lake | Large-scale data engineering |

---

## Module 3 — Generative AI, Foundation Models & RAG

| Local Implementation | AWS Equivalent | Notes |
|---------------------|----------------|-------|
| Keyword/TF-IDF retrieval | Amazon Kendra (semantic search) | Managed enterprise search |
| Template-based answer generation | Amazon Bedrock (Claude/Titan) | Foundation model inference |
| Evidence passage selection | Amazon Bedrock Knowledge Bases | Managed RAG pipeline |
| Optional Ollama (local LLM) | Amazon Bedrock (fully managed) | No local GPU needed |
| FAISS (optional) | Amazon OpenSearch with vector engine | Vector similarity search |
| Sentence Transformers (optional) | Amazon SageMaker Embeddings | Managed embedding models |
| Prompt template | Bedrock Prompt Management | Versioned, managed prompts |

---

## Module 4 — Cloud Security, Cryptography & Governance

| Local Implementation | AWS Equivalent | Notes |
|---------------------|----------------|-------|
| bcrypt password hashing | AWS Cognito User Pools | Managed identity, MFA, SSO |
| JWT authentication | AWS Cognito + API Gateway Authorizer | Token-based auth at gateway |
| Role-based access control | AWS IAM Roles + Policies | Fine-grained permissions |
| Ownership check (IDOR prevention) | IAM Resource-Based Policies | Access control per resource |
| Audit logs (SQLite) | AWS CloudTrail | Immutable, tamper-evident audit trail |
| Application logs (Winston) | Amazon CloudWatch Logs | Centralised log management |
| Rate limiting (express-rate-limit) | AWS WAF Rate-Based Rules | Managed web application firewall |
| Security headers (Helmet) | CloudFront Security Policy | HTTP security headers at edge |
| `.env` secrets | AWS Secrets Manager | Encrypted secrets with rotation |
| File validation | Amazon Macie + S3 Object Lambda | AI-powered data classification |
| UUID upload filenames | S3 SSE-KMS | Encrypted key-managed storage |
| Docker network isolation | AWS VPC + Security Groups | Network-level isolation |
| Threat detection (rate limiter) | Amazon GuardDuty | Continuous threat monitoring |
| No-op: TLS in local dev | AWS Certificate Manager + ALB | Managed TLS termination |

---

## Architecture Comparison Diagram

```
LOCAL PROTOTYPE                    AWS PRODUCTION EQUIVALENT
─────────────────────              ──────────────────────────
Browser                            Browser
  │                                  │
Vite (port 5173)          ──►     S3 + CloudFront
  │                                  │
Express API (port 3001)   ──►     API Gateway + ECS/Lambda
  │                                  │
JWT + bcrypt              ──►     Cognito + IAM
  │                                  │
SQLite + Prisma           ──►     RDS PostgreSQL / DynamoDB
  │                                  │
uploads/ directory        ──►     S3 (encrypted, private)
  │                                  │
Winston logs              ──►     CloudWatch Logs
  │                                  │
Audit log table           ──►     CloudTrail
  │                                  │
Rate limiter              ──►     WAF + GuardDuty
  │                                  │
pdfjs-dist extraction     ──►     Amazon Textract
  │                                  │
Keyword search            ──►     Amazon Kendra / OpenSearch
  │                                  │
Template QA               ──►     Amazon Bedrock (RAG)
  │                                  │
Docker Compose            ──►     ECS + ECR + Fargate
  │                                  │
GitHub Actions            ──►     CodePipeline + CodeBuild
```
