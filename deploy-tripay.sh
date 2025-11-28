#!/bin/bash

# Tripay Integration Deployment Script
# This script deploys the Tripay Edge Function to Supabase

echo "🚀 Deploying Tripay Integration..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found!"
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
echo "🔐 Checking Supabase login..."
if ! supabase projects list &> /dev/null
then
    echo "❌ Not logged in to Supabase"
    echo "🔑 Please login..."
    supabase login
fi

echo "✅ Logged in to Supabase"
echo ""

# Link project
echo "🔗 Linking to project..."
supabase link --project-ref gpittnsfzgkdbqnccncn

echo "✅ Project linked"
echo ""

# Deploy Edge Function
echo "📤 Deploying Edge Function..."
supabase functions deploy tripay-callback

echo "✅ Edge Function deployed"
echo ""

# Set secrets
echo "🔐 Setting environment variables..."
supabase secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz

echo "✅ Secrets configured"
echo ""

# Show Edge Function URL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Edge Function URL:"
echo "   https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback"
echo ""
echo "📋 Next Steps:"
echo "   1. Configure Tripay Dashboard:"
echo "      - Login to https://tripay.co.id/member"
echo "      - Set Callback URL to the URL above"
echo "      - Enable callback for all payment methods"
echo ""
echo "   2. Test the integration:"
echo "      npm run dev"
echo "      - Login as member"
echo "      - Go to Top-Up page"
echo "      - Test payment flow"
echo ""
echo "   3. Monitor logs:"
echo "      supabase functions logs tripay-callback --tail"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
