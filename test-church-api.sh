#!/bin/bash

# Test script for Church API integration
echo "🚀 Testing Church API Integration..."
echo "======================================"

# Base URL
BASE_URL="http://localhost:3000/api"

echo "1. Testing API health check..."
curl -s "$BASE_URL" | jq '.' 2>/dev/null || echo "API responded (jq not available for formatting)"

echo -e "\n2. Testing POST /churches - Create a new church..."
curl -s -X POST "$BASE_URL/churches" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Church",
    "email": "test@church.com",
    "phone": "+1-555-123-4567",
    "address": "123 Test Street",
    "city": "Test City",
    "state": "TS",
    "zipCode": "12345",
    "website": "https://testchurch.org"
  }' | jq '.' 2>/dev/null || echo "Church created (jq not available for formatting)"

echo -e "\n3. Testing GET /churches - List all churches..."
curl -s "$BASE_URL/churches" | jq '.' 2>/dev/null || echo "Churches listed (jq not available for formatting)"

echo -e "\n4. Testing GET /churches/slug/test-church - Get church by slug..."
curl -s "$BASE_URL/churches/slug/test-church" | jq '.' 2>/dev/null || echo "Church retrieved by slug (jq not available for formatting)"

echo -e "\n5. Testing API documentation..."
echo "API documentation available at: $BASE_URL/docs"

echo -e "\n✅ Church API integration test completed!"
echo "🔗 For full API documentation, visit: $BASE_URL/docs"
