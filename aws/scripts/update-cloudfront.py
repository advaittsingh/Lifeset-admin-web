#!/usr/bin/env python3
import json
import sys
import subprocess
import tempfile
import os

DIST_ID = "E3B2N2LVRXNG4J"
BACKEND_DOMAIN = "lifeset-production-alb-1834668951.ap-south-1.elb.amazonaws.com"

def main():
    print("🔧 Configuring CloudFront distribution with backend origin...")
    
    # Get current config and ETag
    print("📥 Fetching current distribution configuration...")
    etag_result = subprocess.run(
        ["aws", "cloudfront", "get-distribution-config", "--id", DIST_ID, "--query", "ETag", "--output", "text"],
        capture_output=True,
        text=True
    )
    
    if etag_result.returncode != 0:
        print(f"❌ Error getting ETag: {etag_result.stderr}")
        return 1
    
    etag = etag_result.stdout.strip()
    
    config_result = subprocess.run(
        ["aws", "cloudfront", "get-distribution-config", "--id", DIST_ID, "--query", "DistributionConfig", "--output", "json"],
        capture_output=True,
        text=True
    )
    
    if config_result.returncode != 0:
        print(f"❌ Error getting config: {config_result.stderr}")
        return 1
    
    config = json.loads(config_result.stdout)
    
    # Check if backend origin already exists
    backend_exists = any(origin.get("Id") == "BackendAPIOrigin" for origin in config["Origins"]["Items"])
    
    if backend_exists:
        print("⚠️  Backend origin already exists. Updating...")
    else:
        print("➕ Adding backend origin...")
        backend_origin = {
            "Id": "BackendAPIOrigin",
            "DomainName": BACKEND_DOMAIN,
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
    
    # Add cache behavior for /api/*
    if "CacheBehaviors" not in config:
        config["CacheBehaviors"] = {"Quantity": 0, "Items": []}
    
    if "Items" not in config["CacheBehaviors"]:
        config["CacheBehaviors"]["Items"] = []
    
    cache_items = config["CacheBehaviors"]["Items"]
    api_behavior_index = next((i for i, behavior in enumerate(cache_items) if behavior.get("PathPattern") == "/api/*"), None)
    api_behavior_exists = api_behavior_index is not None
    
    if not api_behavior_exists:
        print("➕ Adding cache behavior for /api/*...")
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
            "OriginRequestPolicyId": "f8cdde0a-09eb-4a25-a047-3b46bad525d3",  # Custom policy to forward Origin header for CORS
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
        config["CacheBehaviors"]["Items"].append(api_cache_behavior)
        config["CacheBehaviors"]["Quantity"] = len(config["CacheBehaviors"]["Items"])
    else:
        print("⚠️  Cache behavior for /api/* already exists. Updating it...")
        # Update existing cache behavior with origin request policy
        existing_behavior = config["CacheBehaviors"]["Items"][api_behavior_index]
        existing_behavior["OriginRequestPolicyId"] = "f8cdde0a-09eb-4a25-a047-3b46bad525d3"
    
    # Write config to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(config, f, indent=2)
        config_file = f.name
    
    try:
        # Update CloudFront distribution
        print("📤 Updating CloudFront distribution...")
        update_result = subprocess.run(
            ["aws", "cloudfront", "update-distribution",
             "--id", DIST_ID,
             "--if-match", etag,
             "--distribution-config", f"file://{config_file}"],
            capture_output=True,
            text=True
        )
        
        if update_result.returncode == 0:
            result_data = json.loads(update_result.stdout)
            print("✅ CloudFront distribution updated successfully!")
            print(f"   Distribution ID: {result_data['Distribution']['Id']}")
            print(f"   Status: {result_data['Distribution']['Status']}")
            print(f"   Domain: {result_data['Distribution']['DomainName']}")
            print("")
            print("⏳ CloudFront deployment is in progress...")
            print("   This typically takes 5-15 minutes to complete.")
            print(f"   Check status at: https://console.aws.amazon.com/cloudfront/v3/home#/distributions/{DIST_ID}")
            print("")
            print("✅ Once deployed, your admin panel will work without mixed content errors!")
            return 0
        else:
            print(f"❌ Error updating distribution:")
            print(update_result.stderr)
            return 1
    finally:
        os.unlink(config_file)

if __name__ == "__main__":
    sys.exit(main())
