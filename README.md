# 🚀 EnterpriseIQ

## Intelligent Enterprise Knowledge Assistant

EnterpriseIQ is an **AI-powered enterprise knowledge assistant** that enables organizations to interact with internal PDF documents using natural language.

The system combines **Retrieval-Augmented Generation (RAG)** with **hybrid information retrieval (FAISS + BM25)** to provide context-aware answers grounded in enterprise documents.

The application is fully containerized using **Docker**, deployed on **AWS EC2**, monitored with **Prometheus and Grafana**, and automatically deployed through a **GitHub Actions CI/CD pipeline**.

🌐 **Live Demo:** http://enterpriseiq.duckdns.org/

---

## 📸 Application Showcase

### Login

Secure authentication using JWT-based authentication.

![EnterpriseIQ Login](docs/login.png)

### Admin Dashboard

Administrators can manage documents and monitor the knowledge base from the dashboard.

![EnterpriseIQ Dashboard](docs/dashboard.png)

### Upload Documents

Administrators can upload enterprise PDF documents to build the organization's knowledge base.

![EnterpriseIQ Document Upload](docs/admin_upload.png)

### Uploaded Documents

Uploaded documents are displayed and managed through the administration interface.

![EnterpriseIQ Documents](docs/documents_uploaded.png)

### AI Knowledge Assistant

Users can ask questions about uploaded enterprise documents and receive context-aware answers generated using the RAG pipeline.

![EnterpriseIQ Chat](docs/chat.png)

---

## 🏗️ System Architecture

![EnterpriseIQ Architecture](docs/architecture.png)

The system follows a containerized architecture consisting of:

```text
                         GitHub Repository
                                │
                                ▼
                         GitHub Actions
                                │
                         Docker Build
                                │
                                ▼
                           Docker Hub
                                │
                                ▼
                         AWS EC2 Instance
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
              ▼                                   ▼
      Frontend Container                   Backend Container
       React + Nginx                         FastAPI
              │                                   │
              └─────────────────┬─────────────────┘
                                │
                                ▼
                       PostgreSQL Database
                                │
                                ▼
                         RAG Pipeline
                     ┌──────────┴──────────┐
                     │                     │
                   FAISS                  BM25
                     │                     │
                     └──────────┬──────────┘
                                │
                       Sentence Transformers
                                │
                                ▼
                       Hugging Face LLM
                                │
                                ▼
                       Grounded AI Response
```

---

## ✨ Key Features

### 🤖 AI & RAG

* Retrieval-Augmented Generation (RAG)
* Hybrid retrieval using **FAISS + BM25**
* Semantic document search
* Context-aware question answering
* Multi-document PDF knowledge base
* Hugging Face LLM integration
* Sentence Transformer embeddings
* Conversation context support
* Source document citations
* Greeting detection

### 👤 User Management

* JWT authentication
* Role-based access control
* Admin and user roles
* Secure login
* Protected API endpoints
* Password management

### 📄 Document Management

* PDF document upload
* Automatic document processing
* Automatic vector index generation
* BM25 index generation
* Document listing
* Document deletion
* Vector database rebuilding

### ⚙️ DevOps & Deployment

* Docker containerization
* Docker Compose
* GitHub Actions CI/CD
* Docker Hub image registry
* AWS EC2 deployment
* Automated production deployment
* Container health checks
* Backend health check endpoint

### 📊 Monitoring & Observability

* Prometheus metrics
* Grafana dashboards
* Node Exporter
* cAdvisor
* FastAPI application metrics
* Host-level monitoring
* Container-level monitoring
* CPU and memory monitoring

---

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* Axios
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication

### AI / Machine Learning

* Retrieval-Augmented Generation (RAG)
* Hugging Face Inference API
* Sentence Transformers
* FAISS
* BM25
* Semantic Search
* Hybrid Information Retrieval

### Database

* PostgreSQL

### DevOps

* Docker
* Docker Compose
* GitHub Actions
* Docker Hub
* AWS EC2

### Monitoring

* Prometheus
* Grafana
* Node Exporter
* cAdvisor

---

## 🔄 How EnterpriseIQ Works

### 1. Document Upload

An administrator uploads one or more enterprise PDF documents through the admin dashboard.

### 2. Document Processing

The backend extracts and processes the document content before splitting it into smaller text chunks.

### 3. Embedding Generation

Each chunk is converted into a vector representation using **Sentence Transformers**.

### 4. Vector Indexing

The generated embeddings are stored in a **FAISS vector index** for semantic similarity search.

### 5. Keyword Indexing

The same document content is indexed using **BM25** to support keyword-based retrieval.

### 6. Hybrid Retrieval

When a user submits a question, EnterpriseIQ combines:

* Semantic similarity search using FAISS
* Keyword-based retrieval using BM25

This improves retrieval quality compared with relying on only one search strategy.

### 7. Context Construction

The most relevant document chunks are selected and combined into the context provided to the LLM.

### 8. AI Response Generation

The retrieved context is sent to the Hugging Face LLM to generate a response grounded in the enterprise documents.

### 9. Conversation Storage

Conversation history and relevant application data are stored in PostgreSQL.

---

## 🔎 Hybrid Search

EnterpriseIQ uses two complementary retrieval approaches.

### FAISS

FAISS performs **semantic similarity search** using vector embeddings.

This allows the system to find documents based on meaning rather than exact keyword matches.

### BM25

BM25 performs **keyword-based information retrieval**.

It is particularly useful when users search for:

* Specific names
* Technical terms
* Product names
* Identifiers
* Exact phrases

### Hybrid Retrieval

Combining both approaches provides more robust document retrieval:

```text
User Question
      │
      ├───────────────┐
      ▼               ▼
   FAISS             BM25
 Semantic Search   Keyword Search
      │               │
      └───────┬───────┘
              ▼
       Relevant Chunks
              │
              ▼
        Context Builder
              │
              ▼
         Hugging Face
              │
              ▼
       Grounded Answer
```

---

# 📊 Monitoring & Observability

EnterpriseIQ includes production-style monitoring using **Prometheus and Grafana**.

### Grafana Dashboard

![Grafana Dashboard](docs/grafana-dashboard.png)

The monitoring stack provides visibility into application, host, and container performance.

### Prometheus Targets

![Prometheus Targets](docs/prometheus-targets.png)

Prometheus collects metrics from the configured monitoring targets.

### AWS EC2 Deployment

![AWS EC2 Deployment](docs/aws-ec2.png)

EnterpriseIQ is deployed to an AWS EC2 instance using Docker containers.

### Monitored Metrics

* CPU usage
* Memory usage
* Host metrics
* Docker container metrics
* Backend application metrics
* Service health
* Container availability

The monitoring stack can also be extended with alerts for conditions such as high CPU utilization or backend service failures.

---

# 🔄 CI/CD Pipeline

EnterpriseIQ uses **GitHub Actions** to automate the build and deployment process.

![GitHub Actions](docs/github_action.png)

```text
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    ├── Build Docker Images
    │
    ├── Push Images
    │
    ▼
Docker Hub
    │
    ▼
AWS EC2
    │
    ├── Pull Latest Images
    │
    ├── Restart Containers
    │
    ▼
Updated Production Application
```

Every push to the configured branch triggers the automated CI/CD workflow.

---

# 🔐 Security

EnterpriseIQ implements several application-level security mechanisms:

* JWT-based authentication
* Role-based authorization
* Protected admin endpoints
* Authentication middleware
* Secure API routing
* Password hashing
* Environment-based configuration
* Sensitive configuration excluded from source control
* Docker container isolation

---

# 📁 Project Structure

```text
EnterpriseIQ/
│
├── app/
│   ├── auth/
│   ├── database/
│   ├── llm/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── vector_db/
│   └── main.py
│
├── frontend/
│
├── monitoring/
│   ├── grafana/
│   └── prometheus/
│
├── docker-compose.yml
├── README.md
└── ...
```

---

# 🚀 Deployment

EnterpriseIQ is deployed using a containerized production architecture.

### Deployment Components

| Component               | Technology           |
| ----------------------- | -------------------- |
| Frontend                | React + Nginx        |
| Backend                 | FastAPI              |
| Database                | PostgreSQL           |
| Containerization        | Docker               |
| Container Orchestration | Docker Compose       |
| Cloud                   | AWS EC2              |
| Image Registry          | Docker Hub           |
| CI/CD                   | GitHub Actions       |
| Monitoring              | Prometheus + Grafana |
| Host Monitoring         | Node Exporter        |
| Container Monitoring    | cAdvisor             |

---

# 🧪 Health Checks

EnterpriseIQ includes health-check mechanisms to improve service reliability.

The system can verify the availability of backend services and Docker containers before considering the deployment healthy.

This supports basic **service availability monitoring and operational reliability**.

---

# 🔮 Future Improvements

Potential future enhancements include:

* HTTPS using Let's Encrypt
* Cloudflare integration
* Kubernetes deployment
* Loki centralized logging
* Redis caching
* Multi-tenant architecture
* Document versioning
* User activity auditing
* Multi-model LLM support
* Advanced alerting
* Automated backup and recovery
* Infrastructure as Code using Terraform

---

# 🎯 Learning Outcomes

This project provided practical experience in:

* AI Engineering
* Retrieval-Augmented Generation
* Hybrid Information Retrieval
* Large Language Model integration
* FastAPI development
* React development
* PostgreSQL
* Docker containerization
* Docker Compose
* AWS EC2 deployment
* GitHub Actions CI/CD
* Docker Hub
* Prometheus monitoring
* Grafana observability
* Linux-based cloud deployment
* Production-oriented application architecture

---

# 💡 Why EnterpriseIQ?

EnterpriseIQ demonstrates how modern AI applications can be combined with **software engineering, cloud deployment, DevOps, and observability**.

Rather than building only an AI chatbot, the project covers the complete application lifecycle:

```text
AI / RAG
   +
Backend Engineering
   +
Frontend Engineering
   +
Database
   +
Containerization
   +
Cloud Deployment
   +
CI/CD
   +
Monitoring
   =
Production-Oriented AI Application
```

---

# 👨‍💻 Author

**Dinith Pamunuwatte**

Software Engineering Undergraduate

Interested in:

* AI Engineering
* Machine Learning
* MLOps
* DevOps
* Cloud Computing

---

## 🌐 Project Links

* **Live Demo:** http://enterpriseiq.duckdns.org/
* **GitHub Repository:** https://github.com/dinithanki/enterprise-rag

---

⭐ If you found EnterpriseIQ interesting, consider giving the repository a star!
