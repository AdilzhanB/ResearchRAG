#!/bin/bash

# Legal Research Assistant - Deployment Script
# This script automates the deployment process for different environments

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="legal-research-assistant"
NAMESPACE="legal-research"

# Default values
ENVIRONMENT="development"
SKIP_BUILD=false
SKIP_TESTS=false
DRY_RUN=false
VERBOSE=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to display usage
show_usage() {
    cat << EOF
Legal Research Assistant Deployment Script

Usage: $0 [OPTIONS] COMMAND

Commands:
    build           Build Docker images
    test            Run all tests
    deploy          Deploy to specified environment
    rollback        Rollback to previous version
    status          Show deployment status
    logs            Show application logs
    cleanup         Clean up old resources

Options:
    -e, --environment ENV    Target environment (development|staging|production)
    -s, --skip-build        Skip building Docker images
    -t, --skip-tests        Skip running tests
    -d, --dry-run           Show what would be executed without running
    -v, --verbose           Enable verbose output
    -h, --help              Show this help message

Examples:
    $0 deploy -e staging
    $0 build -v
    $0 test --skip-build
    $0 rollback -e production

EOF
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    local missing_tools=()

    # Check required tools
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
    command -v kubectl >/dev/null 2>&1 || missing_tools+=("kubectl")
    command -v helm >/dev/null 2>&1 || missing_tools+=("helm")

    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_status "Please install the missing tools and try again."
        exit 1
    fi

    # Check Docker daemon
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running"
        exit 1
    fi

    # Check Kubernetes connection
    if ! kubectl cluster-info >/dev/null 2>&1; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi

    print_success "All prerequisites satisfied"
}

# Function to load environment variables
load_environment() {
    local env_file=".env"
    
    if [[ "$ENVIRONMENT" != "development" ]]; then
        env_file=".env.${ENVIRONMENT}"
    fi

    if [[ -f "$env_file" ]]; then
        print_status "Loading environment variables from $env_file"
        set -a
        source "$env_file"
        set +a
    else
        print_warning "Environment file $env_file not found"
    fi
}

# Function to build Docker images
build_images() {
    if [[ "$SKIP_BUILD" == "true" ]]; then
        print_status "Skipping Docker image build"
        return 0
    fi

    print_status "Building Docker images..."

    # Build backend image
    print_status "Building backend image..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "Would run: docker build -t ${PROJECT_NAME}-backend:latest ./backend"
    else
        docker build -t "${PROJECT_NAME}-backend:latest" ./backend
        
        if [[ "$ENVIRONMENT" != "development" ]]; then
            docker tag "${PROJECT_NAME}-backend:latest" "${PROJECT_NAME}-backend:${ENVIRONMENT}"
        fi
    fi

    # Build frontend image
    print_status "Building frontend image..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "Would run: docker build -t ${PROJECT_NAME}-frontend:latest ./frontend"
    else
        docker build -t "${PROJECT_NAME}-frontend:latest" ./frontend
        
        if [[ "$ENVIRONMENT" != "development" ]]; then
            docker tag "${PROJECT_NAME}-frontend:latest" "${PROJECT_NAME}-frontend:${ENVIRONMENT}"
        fi
    fi

    print_success "Docker images built successfully"
}

# Function to run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        print_status "Skipping tests"
        return 0
    fi

    print_status "Running tests..."

    # Backend tests
    print_status "Running backend tests..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "Would run backend tests"
    else
        cd backend
        python -m pytest --cov=app --cov-report=term-missing
        cd ..
    fi

    # Frontend tests
    print_status "Running frontend tests..."
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "Would run frontend tests"
    else
        cd frontend
        npm run test
        cd ..
    fi

    print_success "All tests passed"
}

# Function to deploy to environment
deploy() {
    print_status "Deploying to $ENVIRONMENT environment..."

    case "$ENVIRONMENT" in
        "development")
            deploy_development
            ;;
        "staging")
            deploy_staging
            ;;
        "production")
            deploy_production
            ;;
        *)
            print_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

# Function to deploy to development (Docker Compose)
deploy_development() {
    print_status "Deploying to development environment using Docker Compose..."

    if [[ "$DRY_RUN" == "true" ]]; then
        echo "Would run: docker-compose up -d"
        return 0
    fi

    # Ensure environment file exists
    if [[ ! -f ".env" ]]; then
        cp ".env.example" ".env"
        print_warning "Created .env file from .env.example. Please update with your configuration."
    fi

    # Start services
    docker-compose up -d

    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30

    # Run health checks
    check_health_development

    print_success "Development deployment completed"
}

# Function to deploy to staging/production (Kubernetes)
deploy_staging() {
    deploy_kubernetes "staging"
}

deploy_production() {
    deploy_kubernetes "production"
}

deploy_kubernetes() {
    local env="$1"
    print_status "Deploying to $env environment using Kubernetes..."

    if [[ "$DRY_RUN" == "true" ]]; then
        echo "Would deploy to Kubernetes namespace: $NAMESPACE"
        return 0
    fi

    # Create namespace if it doesn't exist
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

    # Apply Kubernetes manifests
    print_status "Applying Kubernetes manifests..."
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/config.yaml
    kubectl apply -f k8s/postgres.yaml
    kubectl apply -f k8s/redis.yaml
    kubectl apply -f k8s/backend.yaml
    kubectl apply -f k8s/frontend.yaml
    kubectl apply -f k8s/ingress.yaml

    # Wait for deployments
    print_status "Waiting for deployments to be ready..."
    kubectl rollout status deployment/legal-research-backend -n "$NAMESPACE" --timeout=600s
    kubectl rollout status deployment/legal-research-frontend -n "$NAMESPACE" --timeout=600s

    # Run health checks
    check_health_kubernetes

    print_success "$env deployment completed"
}

# Function to check health in development
check_health_development() {
    print_status "Running health checks..."

    # Check backend health
    local backend_health
    if backend_health=$(curl -s -f http://localhost:8000/health 2>/dev/null); then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi

    # Check frontend
    if curl -s -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_error "Frontend health check failed"
        return 1
    fi
}

# Function to check health in Kubernetes
check_health_kubernetes() {
    print_status "Running Kubernetes health checks..."

    # Check pod status
    local pods_ready
    pods_ready=$(kubectl get pods -n "$NAMESPACE" --no-headers | grep -v "Running\|Completed" | wc -l)
    
    if [[ "$pods_ready" -eq 0 ]]; then
        print_success "All pods are running"
    else
        print_error "Some pods are not ready"
        kubectl get pods -n "$NAMESPACE"
        return 1
    fi

    # Check service endpoints
    local backend_endpoint
    backend_endpoint=$(kubectl get service legal-research-backend-service -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}')
    
    if kubectl exec -n "$NAMESPACE" deployment/legal-research-backend -- curl -s -f "http://localhost:8000/health" >/dev/null; then
        print_success "Backend service is healthy"
    else
        print_error "Backend service health check failed"
        return 1
    fi
}

# Function to show deployment status
show_status() {
    print_status "Deployment status for $ENVIRONMENT environment:"

    case "$ENVIRONMENT" in
        "development")
            docker-compose ps
            ;;
        "staging"|"production")
            kubectl get all -n "$NAMESPACE"
            echo
            print_status "Pod status:"
            kubectl get pods -n "$NAMESPACE" -o wide
            echo
            print_status "Service status:"
            kubectl get services -n "$NAMESPACE"
            ;;
    esac
}

# Function to show logs
show_logs() {
    local service="${1:-}"
    
    print_status "Showing logs for $ENVIRONMENT environment:"

    case "$ENVIRONMENT" in
        "development")
            if [[ -n "$service" ]]; then
                docker-compose logs -f "$service"
            else
                docker-compose logs -f
            fi
            ;;
        "staging"|"production")
            if [[ -n "$service" ]]; then
                kubectl logs -f deployment/"$service" -n "$NAMESPACE"
            else
                kubectl logs -f deployment/legal-research-backend -n "$NAMESPACE" &
                kubectl logs -f deployment/legal-research-frontend -n "$NAMESPACE" &
                wait
            fi
            ;;
    esac
}

# Function to rollback deployment
rollback() {
    print_status "Rolling back $ENVIRONMENT deployment..."

    case "$ENVIRONMENT" in
        "development")
            print_warning "Rollback not supported for development environment"
            ;;
        "staging"|"production")
            kubectl rollout undo deployment/legal-research-backend -n "$NAMESPACE"
            kubectl rollout undo deployment/legal-research-frontend -n "$NAMESPACE"
            
            print_status "Waiting for rollback to complete..."
            kubectl rollout status deployment/legal-research-backend -n "$NAMESPACE"
            kubectl rollout status deployment/legal-research-frontend -n "$NAMESPACE"
            
            print_success "Rollback completed"
            ;;
    esac
}

# Function to cleanup resources
cleanup() {
    print_status "Cleaning up resources for $ENVIRONMENT environment..."

    case "$ENVIRONMENT" in
        "development")
            if [[ "$DRY_RUN" == "true" ]]; then
                echo "Would run: docker-compose down -v"
                echo "Would run: docker system prune -f"
            else
                docker-compose down -v
                docker system prune -f
            fi
            ;;
        "staging"|"production")
            if [[ "$DRY_RUN" == "true" ]]; then
                echo "Would delete namespace: $NAMESPACE"
            else
                kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
            fi
            ;;
    esac

    print_success "Cleanup completed"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -s|--skip-build)
                SKIP_BUILD=true
                shift
                ;;
            -t|--skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                set -x
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            build|test|deploy|rollback|status|logs|cleanup)
                COMMAND="$1"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    if [[ -z "${COMMAND:-}" ]]; then
        print_error "No command specified"
        show_usage
        exit 1
    fi
}

# Main function
main() {
    parse_args "$@"

    print_status "Legal Research Assistant Deployment Script"
    print_status "Environment: $ENVIRONMENT"
    print_status "Command: $COMMAND"
    print_status "Dry run: $DRY_RUN"

    if [[ "$DRY_RUN" != "true" ]]; then
        check_prerequisites
    fi

    load_environment

    case "$COMMAND" in
        "build")
            build_images
            ;;
        "test")
            run_tests
            ;;
        "deploy")
            build_images
            run_tests
            deploy
            ;;
        "rollback")
            rollback
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
