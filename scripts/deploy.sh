#!/bin/bash

# kanpAI Production Deployment Script
# This script handles the complete deployment process for kanpAI

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
fi

if ! docker info >/dev/null 2>&1; then
    error "Docker is not running. Please start Docker first."
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    error "Docker Compose is not installed. Please install Docker Compose first."
fi

# Function to check if .env.production exists and is configured
check_env_file() {
    if [[ ! -f ".env.production" ]]; then
        error ".env.production file not found. Please create it from the template."
    fi
    
    # Check for placeholder values
    if grep -q "REPLACE_WITH" ".env.production" || grep -q "YOUR_PRODUCTION" ".env.production"; then
        error ".env.production contains placeholder values. Please replace them with actual production values."
    fi
    
    success "Environment file validation passed"
}

# Function to create SSL directory structure
setup_ssl() {
    log "Setting up SSL directory structure..."
    mkdir -p nginx/ssl
    
    if [[ ! -f "nginx/ssl/your-domain.com.crt" ]] || [[ ! -f "nginx/ssl/your-domain.com.key" ]]; then
        warning "SSL certificates not found. HTTPS will not be available."
        warning "Please add your SSL certificates to nginx/ssl/ directory:"
        warning "  - nginx/ssl/your-domain.com.crt"
        warning "  - nginx/ssl/your-domain.com.key"
        warning "The application will run on HTTP for now."
    else
        success "SSL certificates found"
    fi
}

# Function to perform pre-deployment checks
pre_deployment_checks() {
    log "Performing pre-deployment checks..."
    
    # Check environment file
    check_env_file
    
    # Check SSL setup
    setup_ssl
    
    # Check if ports are available
    if netstat -tuln | grep -q ":80 "; then
        warning "Port 80 is already in use. Make sure no other web server is running."
    fi
    
    if netstat -tuln | grep -q ":443 "; then
        warning "Port 443 is already in use. Make sure no other web server is running."
    fi
    
    success "Pre-deployment checks completed"
}

# Function to build and start services
deploy_services() {
    log "Starting deployment..."
    
    # Stop existing services if running
    log "Stopping existing services..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose -f docker-compose.prod.yml pull
    
    # Build application images
    log "Building application images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    success "Services started successfully"
}

# Function to check service health
check_health() {
    log "Checking service health..."
    
    # Wait for services to start
    sleep 30
    
    # Check database
    if docker-compose -f docker-compose.prod.yml exec -T database pg_isready -U kanpai_user -d kanpai_production; then
        success "Database is healthy"
    else
        error "Database health check failed"
    fi
    
    # Check backend
    if curl -sf http://localhost/api/health > /dev/null; then
        success "Backend is healthy"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend
    if curl -sf http://localhost/health > /dev/null; then
        success "Frontend is healthy"
    else
        error "Frontend health check failed"
    fi
    
    success "All services are healthy"
}

# Function to create initial backup
create_initial_backup() {
    log "Creating initial database backup..."
    
    # Wait a bit more for database to be fully ready
    sleep 10
    
    docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js create
    
    success "Initial backup created"
}

# Function to show deployment summary
show_summary() {
    echo
    echo "=================================================="
    echo "          kanpAI DEPLOYMENT COMPLETE!"
    echo "=================================================="
    echo
    echo "🌐 Application URL: http://your-domain.com"
    echo "👑 Admin Panel: http://admin.your-domain.com"
    echo "📊 Health Check: http://your-domain.com/api/health"
    echo
    echo "📋 Next Steps:"
    echo "1. Update domain names in nginx/nginx.conf"
    echo "2. Add SSL certificates to nginx/ssl/"
    echo "3. Configure DNS to point to this server"
    echo "4. Set up automated backups with cron"
    echo "5. Configure monitoring and alerts"
    echo
    echo "🔧 Useful Commands:"
    echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  Stop app: docker-compose -f docker-compose.prod.yml down"
    echo "  Update app: $0"
    echo "  Backup DB: docker-compose -f docker-compose.prod.yml run --rm backup node scripts/backup-database.js create"
    echo
}

# Main deployment function
main() {
    echo
    echo "=================================================="
    echo "         kanpAI Production Deployment"
    echo "=================================================="
    echo
    
    # Change to script directory
    cd "$(dirname "$0")/.."
    
    # Run deployment steps
    pre_deployment_checks
    deploy_services
    check_health
    create_initial_backup
    show_summary
    
    success "Deployment completed successfully!"
}

# Run main function
main "$@"