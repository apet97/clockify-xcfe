#!/bin/bash
set -e

# xCustom Field Expander - 24h Dry Run Testing Script
# Usage: ./scripts/run-dryrun-24h.sh [--user-id USER_ID]

API_URL=${API_URL:-"http://localhost:8080"}
AUTH_TOKEN=${AUTH_TOKEN:-""}

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
    echo "  --user-id USER_ID   Run backfill for specific user only"
    echo "  --help             Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  API_URL            API base URL (default: http://localhost:8080)"
    echo "  AUTH_TOKEN         Bearer token for API authentication"
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

get_auth_token() {
    if [ -n "$AUTH_TOKEN" ]; then
        echo "$AUTH_TOKEN"
        return 0
    fi
    
    log_warning "No AUTH_TOKEN provided"
    log_info "You can get a token by:"
    log_info "1. Starting the admin UI: pnpm run dev"
    log_info "2. Visiting http://localhost:5173"
    log_info "3. Using the magic link authentication"
    log_info "4. Copying the token from browser dev tools"
    echo ""
    echo -n "Enter your auth token (or press Enter to skip auth): "
    read -r token
    echo "$token"
}

run_dryrun_backfill() {
    local user_id="$1"
    local endpoint="$API_URL/v1/backfill"
    local auth_token=$(get_auth_token)
    
    # Calculate date range (last 24 hours)
    local to_date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local from_date
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        from_date=$(date -u -v-24H +"%Y-%m-%dT%H:%M:%SZ")
    else
        # Linux
        from_date=$(date -u -d "24 hours ago" +"%Y-%m-%dT%H:%M:%SZ")
    fi
    
    log_info "Date range: $from_date to $to_date"
    
    # Build request payload
    local payload="{\"from\": \"$from_date\", \"to\": \"$to_date\", \"dryRun\": true"
    
    if [ -n "$user_id" ]; then
        payload="$payload, \"userId\": \"$user_id\""
        log_info "Filtering for user: $user_id"
    fi
    
    payload="$payload}"
    
    log_info "Payload: $payload"
    
    # Build curl command
    local curl_cmd="curl -s -w \"\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n\""
    curl_cmd="$curl_cmd -X POST"
    curl_cmd="$curl_cmd -H \"Content-Type: application/json\""
    
    if [ -n "$auth_token" ]; then
        curl_cmd="$curl_cmd -H \"Authorization: Bearer $auth_token\""
    else
        log_warning "Running without authentication - may fail if auth is required"
    fi
    
    curl_cmd="$curl_cmd -d '$payload' '$endpoint'"
    
    echo ""
    log_info "Executing dry run backfill..."
    local response=$(eval "$curl_cmd")
    
    echo ""
    echo "Response:"
    echo "$response"
    
    # Parse response if jq is available
    if command -v jq &> /dev/null; then
        echo ""
        log_info "Parsing results..."
        
        # Extract HTTP status
        local http_status=$(echo "$response" | grep "HTTP Status:" | cut -d' ' -f3)
        
        if [ "$http_status" = "200" ] || [ "$http_status" = "202" ]; then
            # Extract JSON response (everything except the last few lines)
            local json_response=$(echo "$response" | head -n -2)
            
            # Parse key metrics
            local scanned=$(echo "$json_response" | jq -r '.result.scanned // 0')
            local updated=$(echo "$json_response" | jq -r '.result.updated // 0')
            local day_count=$(echo "$json_response" | jq -r '.result.dayResults | length // 0')
            local errors=$(echo "$json_response" | jq -r '[.result.dayResults[]?.errors // 0] | add // 0')
            
            echo ""
            echo "======================================"
            echo "Dry Run Summary"
            echo "======================================"
            echo "Entries Scanned:     $scanned"
            echo "Would Update:        $updated"
            echo "Days Processed:      $day_count"
            echo "Errors:              $errors"
            echo ""
            
            if [ "$updated" -gt 0 ]; then
                log_success "Found $updated entries that would be updated"
                
                # Show daily breakdown
                echo "Daily Breakdown:"
                echo "$json_response" | jq -r '.result.dayResults[] | "  \(.date): \(.entries) entries, \(.updated) updates, \(.errors) errors"'
                
                # Show sample changes
                local sample_count=$(echo "$json_response" | jq -r '.result.outcomes | length')
                if [ "$sample_count" -gt 0 ]; then
                    echo ""
                    echo "Sample Changes (first 5):"
                    echo "$json_response" | jq -r '.result.outcomes[0:5][] | "  Entry \(.entryId[-8:]): \(.updates) updates"'
                fi
            else
                log_info "No entries would be updated"
            fi
            
        else
            log_error "Backfill failed with HTTP $http_status"
            return 1
        fi
    else
        log_warning "jq not available - install for better result parsing"
    fi
}

# Main execution
main() {
    local user_id=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --user-id)
                user_id="$2"
                shift 2
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
    echo "xCFE 24h Dry Run Testing Script"
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
    
    # Run dry run backfill
    echo ""
    run_dryrun_backfill "$user_id"
    
    echo ""
    log_info "Dry run completed. To apply these changes, use the Admin UI or remove 'dryRun: true' from the API call."
}

# Check dependencies
if ! command -v curl &> /dev/null; then
    log_error "curl is required but not installed"
    exit 1
fi

if ! command -v date &> /dev/null; then
    log_error "date command is required but not available"
    exit 1
fi

main "$@"