#!/bin/bash
set -e

# xCustom Field Expander - Development Addon Server Script
# Usage: ./scripts/dev-addon.sh

API_PORT=${PORT:-8080}
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    log_warning ".env file not found. Creating from .env.sample..."
    cp "$PROJECT_ROOT/.env.sample" "$PROJECT_ROOT/.env"
    log_info "Please edit .env with your configuration before continuing"
    exit 1
fi

# Check for required tools
command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed. Aborting."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { log_error "pnpm is required but not installed. Aborting."; exit 1; }

log_info "Starting xCFE Add-on Development Server..."

# Install dependencies
log_info "Installing dependencies..."
cd "$PROJECT_ROOT"
pnpm install

# Run database migrations
log_info "Running database migrations..."
if command -v ./scripts/migrate.sh >/dev/null 2>&1; then
    ./scripts/migrate.sh
else
    log_warning "Migration script not found - make sure your database is set up"
fi

# Build the API
log_info "Building API..."
pnpm --filter @xcfe/api build

# Start the API server in background
log_info "Starting API server on port $API_PORT..."
pnpm --filter @xcfe/api dev &
API_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if curl -sf "http://localhost:$API_PORT/v1/sites/health" >/dev/null 2>&1; then
    log_success "API server is running on http://localhost:$API_PORT"
else
    log_error "Failed to start API server"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

# Start ngrok if available
if command -v ngrok >/dev/null 2>&1; then
    log_info "Starting ngrok tunnel..."
    ngrok http $API_PORT --log=stdout --log-format=json > /tmp/ngrok.log &
    NGROK_PID=$!
    
    # Wait for ngrok to establish tunnel
    sleep 5
    
    # Extract public URL from ngrok
    PUBLIC_URL=""
    if [ -f /tmp/ngrok.log ]; then
        PUBLIC_URL=$(grep -o 'https://[^"]*\.ngrok[^"]*' /tmp/ngrok.log | head -1 | sed 's/\\//g')
    fi
    
    if [ -n "$PUBLIC_URL" ]; then
        log_success "Ngrok tunnel established: $PUBLIC_URL"
        
        # Display URLs for copy-paste
        echo ""
        echo "======================================"
        echo "📋 COPY THESE URLs FOR CLOCKIFY SETUP"
        echo "======================================"
        echo ""
        echo "🔗 Manifest URL (paste in Developer Portal):"
        echo "$PUBLIC_URL/manifest"
        echo ""
        echo "🏠 Base URL (for addon configuration):"
        echo "$PUBLIC_URL"
        echo ""
        echo "🧪 Health Check:"
        echo "$PUBLIC_URL/v1/sites/health"
        echo ""
        echo "======================================"
        echo ""
        
        # Test manifest endpoint
        log_info "Testing manifest endpoint..."
        if curl -sf "$PUBLIC_URL/manifest" >/dev/null 2>&1; then
            log_success "Manifest endpoint is accessible"
            echo ""
            log_info "Manifest JSON:"
            curl -s "$PUBLIC_URL/manifest" | jq . || curl -s "$PUBLIC_URL/manifest"
        else
            log_warning "Manifest endpoint not accessible yet"
        fi
        
    else
        log_warning "Could not extract ngrok URL - check /tmp/ngrok.log"
        kill $NGROK_PID 2>/dev/null || true
    fi
else
    log_warning "ngrok not found - you'll need to expose port $API_PORT manually"
    echo ""
    echo "To install ngrok:"
    echo "  brew install ngrok"
    echo "  # or download from https://ngrok.com/"
    echo ""
    echo "Then run: ngrok http $API_PORT"
fi

# Cleanup function
cleanup() {
    log_info "Shutting down services..."
    kill $API_PID 2>/dev/null || true
    if [ -n "$NGROK_PID" ]; then
        kill $NGROK_PID 2>/dev/null || true
    fi
    rm -f /tmp/ngrok.log
    log_success "Cleanup complete"
}

# Set trap for cleanup
trap cleanup INT TERM EXIT

# Keep script running
log_info "Development server running. Press Ctrl+C to stop."
log_info "Logs will appear below..."
echo ""

# Follow API logs
wait $API_PID