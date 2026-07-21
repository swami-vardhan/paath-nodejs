#!/bin/bash

# Divine Audio - Deployment Script
# This script helps deploy the application to various platforms

set -e

echo "🙏 Divine Audio - Spiritual Audio Library Deployment"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}📿 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is required. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm or bun
    if command -v bun &> /dev/null; then
        BUN_VERSION=$(bun --version)
        print_success "Bun found: $BUN_VERSION"
        PKG_MANAGER="bun"
    elif command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
        PKG_MANAGER="npm"
    else
        print_error "Package manager (bun or npm) is required"
        exit 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found: $DOCKER_VERSION"
    else
        print_warning "Docker not found - Docker deployment options unavailable"
    fi
    
    echo ""
}

# Install dependencies
install_deps() {
    print_header "Installing Dependencies..."
    
    if [ "$PKG_MANAGER" = "bun" ]; then
        bun install
    else
        npm install
    fi
    
    print_success "Dependencies installed"
    echo ""
}

# Setup database
setup_database() {
    print_header "Setting up Database..."
    
    if [ "$PKG_MANAGER" = "bun" ]; then
        bun run db:push
    else
        npx prisma db push
    fi
    
    print_success "Database initialized"
    echo ""
}

# Build application
build_app() {
    print_header "Building Application..."
    
    if [ "$PKG_MANAGER" = "bun" ]; then
        bun run build
    else
        npm run build
    fi
    
    print_success "Build completed"
    echo ""
}

# Start development server
start_dev() {
    print_header "Starting Development Server..."
    
    echo "Starting development server at http://localhost:3000"
    echo "Press Ctrl+C to stop"
    echo ""
    
    if [ "$PKG_MANAGER" = "bun" ]; then
        bun run dev
    else
        npm run dev
    fi
}

# Start production server
start_prod() {
    print_header "Starting Production Server..."
    
    if [ ! -d ".next/standalone" ]; then
        print_warning "Production build not found. Building now..."
        build_app
    fi
    
    echo "Starting production server at http://localhost:3000"
    echo "Press Ctrl+C to stop"
    echo ""
    
    NODE_ENV=production node .next/standalone/server.js
}

# Build Docker image
build_docker() {
    print_header "Building Docker Image..."
    
    docker build -t divine-audio:latest .
    
    print_success "Docker image built: divine-audio:latest"
    echo ""
}

# Run with Docker Compose
run_docker() {
    print_header "Starting with Docker Compose..."
    
    # Create .env if not exists
    if [ ! -f .env ]; then
        print_warning "No .env file found, creating from example..."
        cp .env.example .env
        print_warning "Please edit .env with your configuration"
    fi
    
    docker-compose up -d
    
    print_success "Application started with Docker Compose"
    echo "Access it at http://localhost:3000"
    echo ""
}

# Create deployment package
create_package() {
    print_header "Creating Deployment Package..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    PACKAGE_NAME="divine-audio-${TIMESTAMP}"
    
    # Create temporary directory for package
    mkdir -p "/tmp/${PACKAGE_NAME}"
    
    # Copy necessary files
    cp -r src "/tmp/${PACKAGE_NAME}/"
    cp -r prisma "/tmp/${PACKAGE_NAME}/"
    cp -r public "/tmp/${PACKAGE_NAME}/"
    cp package.json "/tmp/${PACKAGE_NAME}/"
    cp bun.lock "/tmp/${PACKAGE_NAME}/"
    cp next.config.ts "/tmp/${PACKAGE_NAME}/"
    cp tailwind.config.ts "/tmp/${PACKAGE_NAME}/"
    cp postcss.config.mjs "/tmp/${PACKAGE_NAME}/"
    cp tsconfig.json "/tmp/${PACKAGE_NAME}/"
    cp components.json "/tmp/${PACKAGE_NAME}/"
    cp Dockerfile "/tmp/${PACKAGE_NAME}/"
    cp docker-compose.yml "/tmp/${PACKAGE_NAME}/"
    cp .env.example "/tmp/${PACKAGE_NAME}/"
    cp deploy.sh "/tmp/${PACKAGE_NAME}/"
    cp README.md "/tmp/${PACKAGE_NAME}/" 2>/dev/null || true
    
    # Create tar.gz archive
    cd /tmp
    tar -czf "${PACKAGE_NAME}.tar.gz" "${PACKAGE_NAME}/"
    
    # Move to download directory
    mv "${PACKAGE_NAME}.tar.gz" /home/z/my-project/download/
    
    # Cleanup
    rm -rf "/tmp/${PACKAGE_NAME}"
    
    print_success "Package created: /home/z/my-project/download/${PACKAGE_NAME}.tar.gz"
    echo ""
}

# Show help
show_help() {
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  check       Check prerequisites"
    echo "  install     Install dependencies"
    echo "  db          Setup database"
    echo "  build       Build for production"
    echo "  dev         Start development server"
    echo "  start       Start production server"
    echo "  docker      Build Docker image"
    echo "  compose     Run with Docker Compose"
    echo "  package     Create deployment package"
    echo "  all         Full setup (check → install → db → build)"
    echo "  help        Show this help message"
    echo ""
}

# Main script logic
case "${1:-help}" in
    check)
        check_prerequisites
        ;;
    install)
        install_deps
        ;;
    db)
        setup_database
        ;;
    build)
        build_app
        ;;
    dev)
        start_dev
        ;;
    start)
        start_prod
        ;;
    docker)
        build_docker
        ;;
    compose)
        run_docker
        ;;
    package)
        create_package
        ;;
    all)
        check_prerequisites
        install_deps
        setup_database
        build_app
        print_success "Setup complete! Run './deploy.sh start' to begin."
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
