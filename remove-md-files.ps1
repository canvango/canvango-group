# Script untuk remove file .md dari Git tracking
# File ini akan remove dari Git tapi tetap ada di local

Write-Host "Removing .md files from Git tracking..." -ForegroundColor Yellow

# Remove semua file .md dari Git tracking
git rm --cached "*.md" -r

# Add back file .md yang penting
Write-Host ""
Write-Host "Adding back important documentation..." -ForegroundColor Green

# Check dan add back jika file ada
$importantFiles = @(
    "README.md",
    "CHANGELOG.md", 
    "CONTRIBUTING.md",
    "LICENSE.md"
)

foreach ($file in $importantFiles) {
    if (Test-Path $file) {
        git add -f $file
        Write-Host "Kept: $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Done! Now commit and push:" -ForegroundColor Cyan
Write-Host "  git commit -m 'chore: remove development notes from repository'" -ForegroundColor White
Write-Host "  git push" -ForegroundColor White
