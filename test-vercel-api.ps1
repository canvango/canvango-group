# Test Vercel API Route
Write-Host "Testing Vercel API Route..." -ForegroundColor Yellow
Write-Host ""

# Get auth token from Supabase (you need to replace this with actual token)
Write-Host "⚠️ You need to get auth token from browser:" -ForegroundColor Red
Write-Host "1. Open browser console on canvango.com" -ForegroundColor Cyan
Write-Host "2. Run: localStorage.getItem('sb-gpittnsfzgkdbqnccncn-auth-token')" -ForegroundColor Cyan
Write-Host "3. Copy the access_token value" -ForegroundColor Cyan
Write-Host ""

$token = Read-Host "Paste your access_token here"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ No token provided. Exiting..." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Testing API route with your token..." -ForegroundColor Yellow

$body = @{
    amount = 10000
    paymentMethod = "QRIS2"
    customerName = "Test User"
    customerEmail = "test@example.com"
    customerPhone = ""
    orderItems = @(
        @{
            name = "Top-Up Saldo"
            price = 10000
            quantity = 1
        }
    )
    returnUrl = "https://canvango.com/riwayat-transaksi"
    expiredTime = 24
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    Write-Host "Sending request to: https://www.canvango.com/api/tripay-proxy" -ForegroundColor Cyan
    Write-Host ""
    
    $response = Invoke-WebRequest -Uri "https://www.canvango.com/api/tripay-proxy" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody -ForegroundColor Red
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
