#!/bin/bash
set -e

# xCustom Field Expander - Sample Webhook Testing Script
# Usage: ./scripts/push-sample-webhook.sh [--with-signature]

API_URL=${API_URL:-"http://localhost:8080"}
WEBHOOK_SECRET=${CLOCKIFY_WEBHOOK_SECRET:-""}
SAMPLE_FILE="docs/sample-webhook.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --with-signature    Include HMAC signature header"
    echo "  --without-signature Send unsigned payload (default)"
    echo "  --help             Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  API_URL                 API base URL (default: http://localhost:8080)"
    echo "  CLOCKIFY_WEBHOOK_SECRET Secret for signing (required with --with-signature)"
}

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

generate_signature() {
    local payload="$1"
    local secret="$2"
    
    if [ -z "$secret" ]; then
        log_error "CLOCKIFY_WEBHOOK_SECRET not set but signature requested"
        exit 1
    fi
    
    # Generate HMAC SHA-256 signature
    echo -n "$payload" | openssl dgst -sha256 -hmac "$secret" | sed 's/^.* //'
}

test_webhook() {
    local use_signature="$1"
    local endpoint="$API_URL/v1/webhooks/clockify"
    
    if [ ! -f "$SAMPLE_FILE" ]; then
        log_error "Sample webhook file not found: $SAMPLE_FILE"
        exit 1
    fi
    
    local payload=$(cat "$SAMPLE_FILE")
    local headers=("Content-Type: application/json")
    
    if [ "$use_signature" = true ]; then
        if [ -z "$WEBHOOK_SECRET" ]; then
            log_error "CLOCKIFY_WEBHOOK_SECRET not set but signature requested"
            exit 1
        fi
        
        local signature=$(generate_signature "$payload" "$WEBHOOK_SECRET")
        headers+=("X-Clockify-Signature: sha256=$signature")
        log_info "Generated signature: sha256=$signature"
    else
        log_warning "Sending unsigned webhook payload"
    fi
    
    log_info "Testing webhook endpoint: $endpoint"
    log_info "Payload preview: $(echo "$payload" | jq -c . | head -c 100)..."
    
    # Build curl command with headers
    local curl_cmd="curl -s -w \"\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n\" -X POST"
    
    for header in "${headers[@]}"; do
        curl_cmd="$curl_cmd -H \"$header\""
    done
    
    curl_cmd="$curl_cmd -d '$payload' '$endpoint'"
    
    echo ""
    log_info "Executing request..."
    local response=$(eval "$curl_cmd")
    
    echo ""
    echo "Response:"
    echo "$response"
    
    # Extract HTTP status from response
    local http_status=$(echo "$response" | grep "HTTP Status:" | cut -d' ' -f3)
    
    if [ "$http_status" = "200" ] || [ "$http_status" = "201" ] || [ "$http_status" = "202" ]; then
        log_success "Webhook processed successfully (HTTP $http_status)"
    else
        log_error "Webhook failed with HTTP $http_status"
        return 1
    fi
}

# Main execution
main() {
    local use_signature=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --with-signature)
                use_signature=true
                shift
                ;;
            --without-signature)
                use_signature=false
                shift
                ;;
            --help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    echo "======================================"
    echo "xCFE Webhook Testing Script"
    echo "======================================"
    echo ""
    
    # Check if API is reachable
    log_info "Checking API health..."
    if ! curl -sf "$API_URL/v1/sites/health" > /dev/null; then
        log_error "API not reachable at $API_URL"
        log_info "Make sure the API is running with: pnpm run dev"
        exit 1
    fi
    log_success "API is reachable"
    
    # Test webhook
    echo ""
    test_webhook "$use_signature"
    
    echo ""
    log_info "Test completed. Check the API logs and admin UI for processing results."
    log_info "You can view audit logs at: $API_URL/v1/runs"
}

# Check dependencies
if ! command -v curl &> /dev/null; then
    log_error "curl is required but not installed"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    log_warning "jq not found - output formatting will be limited"
fi

if ! command -v openssl &> /dev/null; then
    log_error "openssl is required for signature generation"
    exit 1
fi

main "$@"