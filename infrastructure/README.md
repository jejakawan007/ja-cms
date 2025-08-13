# 🏗️ Infrastructure - JA-CMS

Infrastructure configuration untuk JA-CMS deployment.

## 📁 Struktur Infrastructure

```
infrastructure/
├── 📁 docker/              # Docker configuration
│   └── docker-compose.yml  # Docker Compose untuk development/production
├── 📁 kubernetes/          # Kubernetes configuration
│   └── ja-cms.yaml        # K8s manifests untuk production
├── 📁 nginx/              # Nginx configuration
│   ├── Dockerfile         # Nginx Docker image
│   └── conf/              # Nginx configuration files
│       └── default.conf   # Main nginx configuration
├── 📁 monitoring/         # Monitoring configuration
├── 📁 deployment/         # Deployment scripts
├── 📁 ssl/               # SSL certificates
└── README.md             # Infrastructure documentation
```

## 🐳 Docker Configuration

### **Development:**
```bash
# Jalankan dengan Docker Compose
cd infrastructure/docker
docker-compose up -d

# Atau dari root directory
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

### **Services:**
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Database:** localhost:5432
- **Redis:** localhost:6379
- **Nginx:** http://localhost:80, https://localhost:443

## ☸️ Kubernetes Configuration

### **Deploy ke Kubernetes:**
```bash
# Apply semua resources
kubectl apply -f infrastructure/kubernetes/ja-cms.yaml

# Check status
kubectl get all -n ja-cms

# Access application
kubectl port-forward svc/nginx-service 8080:80 -n ja-cms
```

### **Services:**
- **Frontend:** 2 replicas dengan health checks
- **Backend:** 2 replicas dengan health checks
- **Database:** 1 replica dengan persistent storage
- **Redis:** 1 replica untuk caching
- **Nginx:** 2 replicas sebagai load balancer

## 🌐 Nginx Configuration

### **Features:**
- ✅ SSL/TLS termination
- ✅ HTTP/2 support
- ✅ Gzip compression
- ✅ Security headers
- ✅ CORS configuration
- ✅ Health checks
- ✅ Static file serving
- ✅ Proxy to frontend/backend

### **SSL Configuration:**
```bash
# Generate self-signed certificate (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infrastructure/nginx/ssl/key.pem \
  -out infrastructure/nginx/ssl/cert.pem \
  -subj "/C=ID/ST=Jakarta/L=Jakarta/O=JA-CMS/OU=IT/CN=localhost"

# Let's Encrypt (production)
certbot --nginx -d ja-cms.example.com
```

## 📊 Monitoring

### **Health Checks:**
- Frontend: `/health`
- Backend: `/health`
- Nginx: `/health`

### **Metrics:**
- Application metrics via Prometheus
- Log aggregation via ELK stack
- Performance monitoring via Grafana

## 🔐 Security

### **SSL/TLS:**
- ✅ HTTPS redirect
- ✅ Modern SSL ciphers
- ✅ HSTS headers
- ✅ Security headers

### **Network Security:**
- ✅ Internal service communication
- ✅ External access via nginx only
- ✅ Rate limiting
- ✅ DDoS protection

## 🚀 Deployment

### **Development:**
```bash
# Setup development environment
./tools/scripts/setup-dev.sh

# Run with Docker
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Or run locally
npm run dev  # Frontend
npm run dev  # Backend
```

### **Production:**
```bash
# Build Docker images
docker build -t ja-cms-frontend ./frontend
docker build -t ja-cms-backend ./backend
docker build -t ja-cms-nginx ./infrastructure/nginx

# Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/ja-cms.yaml

# Or deploy to cloud platform
# AWS ECS, Google Cloud Run, Azure Container Instances
```

## 📋 Environment Variables

### **Required:**
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ja_cms
DB_USERNAME=postgres
DB_PASSWORD=your-secure-password

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Redis
REDIS_URL=redis://localhost:6379

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### **Optional:**
```bash
# Monitoring
PROMETHEUS_ENDPOINT=http://prometheus:9090
GRAFANA_ENDPOINT=http://grafana:3000

# External Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🔧 Maintenance

### **Database Backup:**
```bash
# Backup database
docker exec ja-cms-database pg_dump -U postgres ja_cms > backup.sql

# Restore database
docker exec -i ja-cms-database psql -U postgres ja_cms < backup.sql
```

### **Logs:**
```bash
# View logs
docker-compose -f infrastructure/docker/docker-compose.yml logs -f

# Or individual services
docker-compose -f infrastructure/docker/docker-compose.yml logs frontend
docker-compose -f infrastructure/docker/docker-compose.yml logs backend
docker-compose -f infrastructure/docker/docker-compose.yml logs nginx
```

### **SSL Certificate Renewal:**
```bash
# Let's Encrypt renewal
certbot renew --nginx

# Or manual renewal
certbot --nginx -d ja-cms.example.com
```

## 📚 Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [SSL/TLS Best Practices](https://ssl-config.mozilla.org/)

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Maintainer:** JA-CMS Infrastructure Team 