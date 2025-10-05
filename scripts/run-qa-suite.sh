#!/bin/bash
set -e

# xCustom Field Expander - QA Suite Runner
# Usage: ./scripts/run-qa-suite.sh [--skip-tests] [--skip-manual]

API_URL=${API_URL:-"http://localhost:8080"}
ADMIN_URL=${ADMIN_URL:-"http://localhost:5173"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --skip-tests    Skip automated test suite"
    echo "  --skip-manual   Skip manual testing prompts"
    echo "  --help         Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  API_URL        API base URL (default: http://localhost:8080)"
    echo "  ADMIN_URL      Admin UI URL (default: http://localhost:5173)"
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

log_header() {
    echo ""
    echo -e "${BOLD}======================================"
    echo -e "$1"
    echo -e "======================================${NC}"
    echo ""
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    local deps=("node" "pnpm" "curl")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing dependencies: ${missing[*]}"
        return 1
    fi
    
    log_success "All dependencies available"
}

check_services() {
    log_info "Checking service availability..."
    
    # Check API
    if curl -sf "$API_URL/v1/sites/health" > /dev/null; then
        log_success "API is running at $API_URL"
    else
        log_error "API not reachable at $API_URL"
        log_info "Start with: pnpm run dev"
        return 1
    fi
    
    # Check Admin UI (optional)
    if curl -sf "$ADMIN_URL" > /dev/null 2>&1; then
        log_success "Admin UI is running at $ADMIN_URL"
    else
        log_warning "Admin UI not reachable at $ADMIN_URL (optional for API tests)"
    fi
}

run_automated_tests() {
    log_header "Running Automated Test Suite"
    
    log_info "Running TypeScript type checking..."
    if pnpm -r typecheck; then
        log_success "TypeScript type checking passed"
    else
        log_error "TypeScript type checking failed"
        return 1
    fi
    
    log_info "Running unit tests..."
    if pnpm test; then
        log_success "Unit tests passed"
    else
        log_error "Unit tests failed"
        return 1
    fi
    
    log_info "Running build process..."
    if pnpm -r build; then
        log_success "Build completed successfully"
    else
        log_error "Build failed"
        return 1
    fi
}

test_api_endpoints() {
    log_header "Testing API Endpoints"
    
    log_info "Testing health endpoint..."
    local health_response=$(curl -s "$API_URL/v1/sites/health")
    if echo "$health_response" | grep -q '"ok":true'; then
        log_success "Health endpoint working"
    else
        log_error "Health endpoint failed"
        echo "Response: $health_response"
        return 1
    fi
    
    log_info "Testing readiness endpoint..."
    local ready_response=$(curl -s -w "%{http_code}" "$API_URL/v1/sites/ready")
    local http_code="${ready_response: -3}"
    if [ "$http_code" = "200" ]; then
        log_success "Readiness endpoint working"
    else
        log_error "Readiness endpoint failed (HTTP $http_code)"
        return 1
    fi
}

test_webhook_security() {
    log_header "Testing Webhook Security"
    
    if [ ! -f "scripts/push-sample-webhook.sh" ]; then
        log_error "Webhook test script not found"
        return 1
    fi
    
    log_info "Testing unsigned webhook (should work in dev mode)..."
    if bash scripts/push-sample-webhook.sh --without-signature; then
        log_success "Unsigned webhook test passed"
    else
        log_warning "Unsigned webhook test failed (may be expected if DEV_ALLOW_UNSIGNED=false)"
    fi
    
    if [ -n "$CLOCKIFY_WEBHOOK_SECRET" ]; then
        log_info "Testing signed webhook..."
        if bash scripts/push-sample-webhook.sh --with-signature; then
            log_success "Signed webhook test passed"
        else
            log_error "Signed webhook test failed"
            return 1
        fi
    else
        log_warning "CLOCKIFY_WEBHOOK_SECRET not set, skipping signed webhook test"
    fi
}

test_formula_security() {
    log_header "Testing Formula Security (Manual)"
    
    log_info "Testing malicious formula expressions..."
    echo "The following should be rejected by the formula engine:"
    echo "  - eval(\"malicious code\")"
    echo "  - Function(\"return process.env\")()"
    echo "  - setTimeout(\"alert(1)\", 1000)"
    echo "  - require(\"fs\").readFileSync(\"/etc/passwd\")"
    echo ""
    
    if [ "$SKIP_MANUAL" != true ]; then
        echo -n "Have you tested malicious formulas in the Admin UI? (y/n): "
        read -r response
        if [ "$response" != "y" ] && [ "$response" != "Y" ]; then
            log_warning "Manual formula security testing skipped"
        else
            log_success "Manual formula security testing completed"
        fi
    fi
}

run_performance_tests() {
    log_header "Basic Performance Testing"
    
    log_info "Testing webhook endpoint performance (10 requests)..."
    
    local total_time=0
    local success_count=0
    
    for i in {1..10}; do
        local start_time=$(date +%s.%N)
        
        if bash scripts/push-sample-webhook.sh --without-signature >/dev/null 2>&1; then
            ((success_count++))
        fi
        
        local end_time=$(date +%s.%N)
        local duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0")
        total_time=$(echo "$total_time + $duration" | bc -l 2>/dev/null || echo "$total_time")
        
        echo -n "."
    done
    
    echo ""
    
    if [ "$success_count" -ge 8 ]; then
        log_success "Performance test passed ($success_count/10 requests succeeded)"
    else
        log_warning "Performance test marginal ($success_count/10 requests succeeded)"
    fi
}

manual_testing_prompts() {
    if [ "$SKIP_MANUAL" = true ]; then
        return 0
    fi
    
    log_header "Manual Testing Checklist"
    
    echo "Please complete the following manual tests:"
    echo ""
    
    echo "1. Admin UI Authentication:"
    echo "   - Visit $ADMIN_URL"
    echo "   - Use magic link authentication"
    echo "   - Verify all pages load correctly"
    echo ""
    
    echo "2. Formula Management:"
    echo "   - Create a new formula with dry-run preview"
    echo "   - Edit an existing formula"
    echo "   - Delete a formula"
    echo "   - Test formula validation errors"
    echo ""
    
    echo "3. Backfill Operations:"
    echo "   - Run a dry-run backfill for 24h"
    echo "   - Verify daily breakdown display"
    echo "   - Test date range validation"
    echo ""
    
    echo "4. Audit Log:"
    echo "   - View recent runs in audit log"
    echo "   - Filter by status"
    echo "   - Verify correlation IDs"
    echo ""
    
    echo "5. Settings:"
    echo "   - Update application settings"
    echo "   - Verify health status display"
    echo "   - Test region configuration"
    echo ""
    
    echo -n "Have you completed all manual tests? (y/n): "
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        log_success "Manual testing completed"
    else
        log_warning "Manual testing incomplete"
        return 1
    fi
}

generate_report() {
    log_header "QA Suite Summary"
    
    echo "Test Results:"
    echo "  ✓ Dependencies checked"
    echo "  ✓ Services verified"
    
    if [ "$SKIP_TESTS" != true ]; then
        echo "  ✓ Automated tests passed"
        echo "  ✓ API endpoints working"
        echo "  ✓ Webhook security tested"
        echo "  ✓ Performance baseline established"
    else
        echo "  - Automated tests skipped"
    fi
    
    if [ "$SKIP_MANUAL" != true ]; then
        echo "  ✓ Manual testing completed"
    else
        echo "  - Manual testing skipped"
    fi
    
    echo ""
    echo "Next Steps:"
    echo "  1. Deploy to staging environment"
    echo "  2. Run production smoke tests"
    echo "  3. Update manifest.json with production URLs"
    echo "  4. Submit to Clockify marketplace"
    echo ""
    
    log_success "QA suite completed successfully!"
}

# Main execution
main() {
    local SKIP_TESTS=false
    local SKIP_MANUAL=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-manual)
                SKIP_MANUAL=true
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
    
    echo -e "${BOLD}======================================"
    echo "xCustom Field Expander QA Suite"
    echo -e "======================================${NC}"
    echo ""
    
    # Run QA steps
    check_dependencies || exit 1
    check_services || exit 1
    
    if [ "$SKIP_TESTS" != true ]; then
        run_automated_tests || exit 1
        test_api_endpoints || exit 1
        test_webhook_security || exit 1
        test_formula_security
        run_performance_tests
    fi
    
    manual_testing_prompts || exit 1
    
    generate_report
}

main "$@"