#!/bin/bash

# LifeSet Admin Panel S3/CloudFront Deployment Script
# This script builds and deploys the admin panel to S3 and CloudFront

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGION="ap-south-1"
ENVIRONMENT="production"
PROJECT_NAME="lifeset"
S3_BUCKET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-admin-panel"
# CloudFront Distribution ID - can be set via environment variable or passed as first argument
CLOUDFRONT_DISTRIBUTION_ID="${1:-${CLOUDFRONT_DISTRIBUTION_ID:-}}"
BACKEND_API_URL="${BACKEND_API_URL:-}"

echo -e "${GREEN}Deploying LifeSet Admin Panel...${NC}"
echo "S3 Bucket: $S3_BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Navigate to admin panel directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADMIN_DIR="$(cd "$SCRIPT_DIR/../../" && pwd)"

cd "$ADMIN_DIR"

# Check if S3 bucket exists, create if not
if ! aws s3 ls "s3://$S3_BUCKET_NAME" --region "$REGION" &>/dev/null; then
    echo -e "${YELLOW}Creating S3 bucket...${NC}"
    aws s3 mb "s3://$S3_BUCKET_NAME" --region "$REGION"
    
    # Enable static website hosting
    aws s3 website "s3://$S3_BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html \
        --region "$REGION"
    
    # Set bucket policy for CloudFront (will be updated after CloudFront creation)
    echo -e "${YELLOW}Configuring bucket policy...${NC}"
fi

# Build the admin panel
echo -e "${YELLOW}Building admin panel...${NC}"

# Set API URL if provided
if [ -n "$BACKEND_API_URL" ]; then
    export VITE_API_URL="$BACKEND_API_URL"
    echo "Using API URL: $BACKEND_API_URL"
fi

npm install
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi

# Upload to S3
echo -e "${YELLOW}Uploading files to S3...${NC}"
aws s3 sync dist/ "s3://$S3_BUCKET_NAME" \
    --delete \
    --region "$REGION" \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "service-worker.js"

# Upload HTML files with no cache
aws s3 sync dist/ "s3://$S3_BUCKET_NAME" \
    --delete \
    --region "$REGION" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --exclude "*" \
    --include "*.html" \
    --include "service-worker.js"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    echo "Invalidation ID: $INVALIDATION_ID"
fi

echo ""
echo -e "${GREEN}Admin panel deployed successfully!${NC}"
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    CLOUDFRONT_URL=$(aws cloudfront get-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query 'Distribution.DomainName' \
        --output text)
    echo "CloudFront URL: https://$CLOUDFRONT_URL"
else
    echo "S3 Website URL: http://$S3_BUCKET_NAME.s3-website-$REGION.amazonaws.com"
    echo -e "${YELLOW}Note: Set up CloudFront distribution for HTTPS and custom domain${NC}"
fi

