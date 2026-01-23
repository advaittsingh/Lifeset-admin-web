#!/bin/bash
# Script to configure CloudFront distribution with backend API origin

set -e

DIST_ID="E3B2N2LVRXNG4J"
BACKEND_DOMAIN="lifeset-production-alb-1834668951.ap-south-1.elb.amazonaws.com"
REGION="ap-south-1"

echo "🔧 Configuring CloudFront distribution $DIST_ID with backend origin..."

# Get current config and ETag
echo "📥 Fetching current distribution configuration..."
ETAG=$(aws cloudfront get-distribution-config --id "$DIST_ID" --query 'ETag' --output text)
CONFIG_FILE="/tmp/cf-config-$(date +%s).json"
aws cloudfront get-distribution-config --id "$DIST_ID" --query 'DistributionConfig' --output json > "$CONFIG_FILE"

# Check if backend origin already exists
if grep -q "BackendAPIOrigin" "$CONFIG_FILE"; then
    echo "⚠️  Backend origin already exists. Updating..."
else
    echo "➕ Adding backend origin..."
fi

# Use Python to properly modify the JSON (preserves all fields)
python3 << PYTHON_SCRIPT
import json
import sys

with open("$CONFIG_FILE", "r") as f:
    config = json.load(f)

# Add backend origin if it doesn't exist
backend_exists = any(origin.get("Id") == "BackendAPIOrigin" for origin in config["Origins"]["Items"])

if not backend_exists:
    backend_origin = {
        "Id": "BackendAPIOrigin",
        "DomainName": "$BACKEND_DOMAIN",
        "CustomOriginConfig": {
            "HTTPPort": 80,
            "HTTPSPort": 443,
            "OriginProtocolPolicy": "http-only",
            "OriginSslProtocols": {
                "Quantity": 1,
                "Items": ["TLSv1.2"]
            },
            "OriginReadTimeout": 30,
            "OriginKeepaliveTimeout": 5
        },
        "ConnectionAttempts": 3,
        "ConnectionTimeout": 10,
        "OriginPath": "",
        "CustomHeaders": {
            "Quantity": 0,
            "Items": []
        },
        "OriginShield": {
            "Enabled": False
        }
    }
    config["Origins"]["Items"].append(backend_origin)
    config["Origins"]["Quantity"] = len(config["Origins"]["Items"])

# Add cache behavior for /api/* if it doesn't exist
cache_behaviors = config.get("CacheBehaviors", {})
cache_items = cache_behaviors.get("Items", []) if cache_behaviors else []
api_behavior_exists = any(behavior.get("PathPattern") == "/api/*" for behavior in cache_items)

if not api_behavior_exists:
    api_cache_behavior = {
        "PathPattern": "/api/*",
        "TargetOriginId": "BackendAPIOrigin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 7,
            "Items": ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "Compress": True,
        "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",  # Managed-CachingDisabled
        "OriginRequestPolicyId": "216adef6-5c04-47cd-88a2-3c4875d3c03f",  # Managed-CORS-S3Origin
        "TrustedSigners": {
            "Enabled": False,
            "Quantity": 0
        },
        "TrustedKeyGroups": {
            "Enabled": False,
            "Quantity": 0
        },
        "SmoothStreaming": False,
        "LambdaFunctionAssociations": {
            "Quantity": 0,
            "Items": []
        },
        "FunctionAssociations": {
            "Quantity": 0,
            "Items": []
        },
        "FieldLevelEncryptionId": "",
        "GrpcConfig": {
            "Enabled": False
        }
    }
    
    if "CacheBehaviors" not in config or not config["CacheBehaviors"]:
        config["CacheBehaviors"] = {"Quantity": 0, "Items": []}
    
    if "Items" not in config["CacheBehaviors"]:
        config["CacheBehaviors"]["Items"] = []
    
    config["CacheBehaviors"]["Items"].append(api_cache_behavior)
    config["CacheBehaviors"]["Quantity"] = len(config["CacheBehaviors"]["Items"])

# Write updated config
with open("$CONFIG_FILE", "w") as f:
    json.dump(config, f, indent=2)

print("✅ Configuration updated successfully")
PYTHON_SCRIPT

# Update CloudFront distribution
echo "📤 Updating CloudFront distribution..."
UPDATE_RESULT=$(aws cloudfront update-distribution \
    --id "$DIST_ID" \
    --if-match "$ETAG" \
    --distribution-config "file://$CONFIG_FILE" \
    --query 'Distribution.{Id:Id,Status:Status,DomainName:DomainName}' \
    --output json 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ CloudFront distribution updated successfully!"
    echo "$UPDATE_RESULT" | jq '.'
    echo ""
    echo "⏳ CloudFront deployment is in progress..."
    echo "   This typically takes 5-15 minutes to complete."
    echo "   You can check status at:"
    echo "   https://console.aws.amazon.com/cloudfront/v3/home#/distributions/$DIST_ID"
    echo ""
    echo "✅ Once deployed, your admin panel will work without mixed content errors!"
else
    echo "❌ Error updating distribution:"
    echo "$UPDATE_RESULT"
    exit 1
fi

# Cleanup
rm -f "$CONFIG_FILE"
