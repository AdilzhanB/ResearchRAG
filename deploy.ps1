# Legal Research Assistant - PowerShell Deployment Script
# This script automates the deployment process for different environments on Windows

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet("build", "test", "deploy", "rollback", "status", "logs", "cleanup")]
    [string]$Command,
    
    [Parameter()]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",
    
    [Parameter()]
    [switch]$SkipBuild,
    
    [Parameter()]
    [switch]$SkipTests,
    
    [Parameter()]
    [switch]$DryRun,
    
    [Parameter()]
    [switch]$Verbose,
    
    [Parameter()]
    [string]$Service = ""
)

# Configuration
$ProjectName = "legal-research-assistant"
$Namespace = "legal-research"

# Color functions for output
function Write-Status { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

# Function to show usage
function Show-Usage {
    @"
Legal Research Assistant PowerShell Deployment Script

Usage: .\deploy.ps1 [COMMAND] [OPTIONS]

Commands:
    build           Build Docker images
    test            Run all tests
    deploy          Deploy to specified environment
    rollback        Rollback to previous version
    status          Show deployment status
    logs            Show application logs
    cleanup         Clean up old resources

Options:
    -Environment ENV        Target environment (development|staging|production)
    -SkipBuild             Skip building Docker images
    -SkipTests             Skip running tests
    -DryRun                Show what would be executed without running
    -Verbose               Enable verbose output
    -Service NAME          Specific service for logs command

Examples:
    .\deploy.ps1 deploy -Environment staging
    .\deploy.ps1 build -Verbose
    .\deploy.ps1 test -SkipBuild
    .\deploy.ps1 rollback -Environment production

"@
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."

    $missingTools = @()

    # Check required tools
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { $missingTools += "docker" }
    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) { $missingTools += "kubectl" }
    if (-not (Get-Command helm -ErrorAction SilentlyContinue)) { $missingTools += "helm" }

    if ($missingTools.Count -gt 0) {
        Write-Error "Missing required tools: $($missingTools -join ', ')"
        Write-Status "Please install the missing tools and try again."
        exit 1
    }

    # Check Docker daemon
    try {
        docker info | Out-Null
    }
    catch {
        Write-Error "Docker daemon is not running"
        exit 1
    }

    # Check Kubernetes connection
    try {
        kubectl cluster-info | Out-Null
    }
    catch {
        Write-Error "Cannot connect to Kubernetes cluster"
        exit 1
    }

    Write-Success "All prerequisites satisfied"
}

# Function to load environment variables
function Import-Environment {
    $envFile = ".env"
    
    if ($Environment -ne "development") {
        $envFile = ".env.$Environment"
    }

    if (Test-Path $envFile) {
        Write-Status "Loading environment variables from $envFile"
        Get-Content $envFile | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)") {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
    }
    else {
        Write-Warning "Environment file $envFile not found"
    }
}

# Function to build Docker images
function Build-Images {
    if ($SkipBuild) {
        Write-Status "Skipping Docker image build"
        return
    }

    Write-Status "Building Docker images..."

    # Build backend image
    Write-Status "Building backend image..."
    if ($DryRun) {
        Write-Host "Would run: docker build -t $ProjectName-backend:latest ./backend"
    }
    else {
        docker build -t "$ProjectName-backend:latest" ./backend
        
        if ($Environment -ne "development") {
            docker tag "$ProjectName-backend:latest" "$ProjectName-backend:$Environment"
        }
    }

    # Build frontend image
    Write-Status "Building frontend image..."
    if ($DryRun) {
        Write-Host "Would run: docker build -t $ProjectName-frontend:latest ./frontend"
    }
    else {
        docker build -t "$ProjectName-frontend:latest" ./frontend
        
        if ($Environment -ne "development") {
            docker tag "$ProjectName-frontend:latest" "$ProjectName-frontend:$Environment"
        }
    }

    Write-Success "Docker images built successfully"
}

# Function to run tests
function Invoke-Tests {
    if ($SkipTests) {
        Write-Status "Skipping tests"
        return
    }

    Write-Status "Running tests..."

    # Backend tests
    Write-Status "Running backend tests..."
    if ($DryRun) {
        Write-Host "Would run backend tests"
    }
    else {
        Push-Location backend
        try {
            python -m pytest --cov=app --cov-report=term-missing
        }
        finally {
            Pop-Location
        }
    }

    # Frontend tests
    Write-Status "Running frontend tests..."
    if ($DryRun) {
        Write-Host "Would run frontend tests"
    }
    else {
        Push-Location frontend
        try {
            npm run test
        }
        finally {
            Pop-Location
        }
    }

    Write-Success "All tests passed"
}

# Function to deploy to environment
function Start-Deployment {
    Write-Status "Deploying to $Environment environment..."

    switch ($Environment) {
        "development" { Deploy-Development }
        "staging" { Deploy-Staging }
        "production" { Deploy-Production }
        default {
            Write-Error "Unknown environment: $Environment"
            exit 1
        }
    }
}

# Function to deploy to development (Docker Compose)
function Deploy-Development {
    Write-Status "Deploying to development environment using Docker Compose..."

    if ($DryRun) {
        Write-Host "Would run: docker-compose up -d"
        return
    }

    # Ensure environment file exists
    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Write-Warning "Created .env file from .env.example. Please update with your configuration."
    }

    # Start services
    docker-compose up -d

    # Wait for services to be ready
    Write-Status "Waiting for services to be ready..."
    Start-Sleep 30

    # Run health checks
    Test-HealthDevelopment

    Write-Success "Development deployment completed"
}

# Function to deploy to staging/production (Kubernetes)
function Deploy-Staging { Deploy-Kubernetes "staging" }
function Deploy-Production { Deploy-Kubernetes "production" }

function Deploy-Kubernetes {
    param($env)
    Write-Status "Deploying to $env environment using Kubernetes..."

    if ($DryRun) {
        Write-Host "Would deploy to Kubernetes namespace: $Namespace"
        return
    }

    # Create namespace if it doesn't exist
    kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -

    # Apply Kubernetes manifests
    Write-Status "Applying Kubernetes manifests..."
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/config.yaml
    kubectl apply -f k8s/postgres.yaml
    kubectl apply -f k8s/redis.yaml
    kubectl apply -f k8s/backend.yaml
    kubectl apply -f k8s/frontend.yaml
    kubectl apply -f k8s/ingress.yaml

    # Wait for deployments
    Write-Status "Waiting for deployments to be ready..."
    kubectl rollout status deployment/legal-research-backend -n $Namespace --timeout=600s
    kubectl rollout status deployment/legal-research-frontend -n $Namespace --timeout=600s

    # Run health checks
    Test-HealthKubernetes

    Write-Success "$env deployment completed"
}

# Function to check health in development
function Test-HealthDevelopment {
    Write-Status "Running health checks..."

    # Check backend health
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 10
        Write-Success "Backend is healthy"
    }
    catch {
        Write-Error "Backend health check failed"
        return $false
    }

    # Check frontend
    try {
        Invoke-RestMethod -Uri "http://localhost:3000" -Method Get -TimeoutSec 10 | Out-Null
        Write-Success "Frontend is accessible"
    }
    catch {
        Write-Error "Frontend health check failed"
        return $false
    }

    return $true
}

# Function to check health in Kubernetes
function Test-HealthKubernetes {
    Write-Status "Running Kubernetes health checks..."

    # Check pod status
    $podsNotReady = kubectl get pods -n $Namespace --no-headers | Where-Object { $_ -notmatch "Running|Completed" }
    
    if ($podsNotReady.Count -eq 0) {
        Write-Success "All pods are running"
    }
    else {
        Write-Error "Some pods are not ready"
        kubectl get pods -n $Namespace
        return $false
    }

    # Check service endpoints
    try {
        kubectl exec -n $Namespace deployment/legal-research-backend -- curl -s -f "http://localhost:8000/health" | Out-Null
        Write-Success "Backend service is healthy"
    }
    catch {
        Write-Error "Backend service health check failed"
        return $false
    }

    return $true
}

# Function to show deployment status
function Show-Status {
    Write-Status "Deployment status for $Environment environment:"

    switch ($Environment) {
        "development" {
            docker-compose ps
        }
        { $_ -in @("staging", "production") } {
            kubectl get all -n $Namespace
            Write-Host ""
            Write-Status "Pod status:"
            kubectl get pods -n $Namespace -o wide
            Write-Host ""
            Write-Status "Service status:"
            kubectl get services -n $Namespace
        }
    }
}

# Function to show logs
function Show-Logs {
    Write-Status "Showing logs for $Environment environment:"

    switch ($Environment) {
        "development" {
            if ($Service) {
                docker-compose logs -f $Service
            }
            else {
                docker-compose logs -f
            }
        }
        { $_ -in @("staging", "production") } {
            if ($Service) {
                kubectl logs -f deployment/$Service -n $Namespace
            }
            else {
                Write-Host "Showing backend logs (Ctrl+C to stop):"
                kubectl logs -f deployment/legal-research-backend -n $Namespace
            }
        }
    }
}

# Function to rollback deployment
function Start-Rollback {
    Write-Status "Rolling back $Environment deployment..."

    switch ($Environment) {
        "development" {
            Write-Warning "Rollback not supported for development environment"
        }
        { $_ -in @("staging", "production") } {
            kubectl rollout undo deployment/legal-research-backend -n $Namespace
            kubectl rollout undo deployment/legal-research-frontend -n $Namespace
            
            Write-Status "Waiting for rollback to complete..."
            kubectl rollout status deployment/legal-research-backend -n $Namespace
            kubectl rollout status deployment/legal-research-frontend -n $Namespace
            
            Write-Success "Rollback completed"
        }
    }
}

# Function to cleanup resources
function Start-Cleanup {
    Write-Status "Cleaning up resources for $Environment environment..."

    switch ($Environment) {
        "development" {
            if ($DryRun) {
                Write-Host "Would run: docker-compose down -v"
                Write-Host "Would run: docker system prune -f"
            }
            else {
                docker-compose down -v
                docker system prune -f
            }
        }
        { $_ -in @("staging", "production") } {
            if ($DryRun) {
                Write-Host "Would delete namespace: $Namespace"
            }
            else {
                kubectl delete namespace $Namespace --ignore-not-found=true
            }
        }
    }

    Write-Success "Cleanup completed"
}

# Main execution
function Main {
    Write-Status "Legal Research Assistant PowerShell Deployment Script"
    Write-Status "Environment: $Environment"
    Write-Status "Command: $Command"
    Write-Status "Dry run: $DryRun"

    if (-not $DryRun) {
        Test-Prerequisites
    }

    Import-Environment

    switch ($Command) {
        "build" { Build-Images }
        "test" { Invoke-Tests }
        "deploy" {
            Build-Images
            Invoke-Tests
            Start-Deployment
        }
        "rollback" { Start-Rollback }
        "status" { Show-Status }
        "logs" { Show-Logs }
        "cleanup" { Start-Cleanup }
        default {
            Write-Error "Unknown command: $Command"
            Show-Usage
            exit 1
        }
    }
}

# Execute main function
try {
    Main
}
catch {
    Write-Error "An error occurred: $_"
    exit 1
}
