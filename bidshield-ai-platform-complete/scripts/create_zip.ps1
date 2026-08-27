$sourceDir = "c:\Users\sadha\Downloads\bidcompliance-ai-platform-complete"
$targetZip1 = "c:\Users\sadha\Downloads\bidshield-ai-platform-complete.zip"
$publicZip = Join-Path $sourceDir "public\bidshield-ai-platform-complete.zip"

if (Test-Path $targetZip1) {
    Remove-Item $targetZip1 -Force
}
if (Test-Path $publicZip) {
    Remove-Item $publicZip -Force
}

$items = Get-ChildItem -Path $sourceDir | Where-Object { 
    $_.Name -ne 'node_modules' -and 
    $_.Name -ne '.next' -and 
    $_.Name -ne '.git' -and
    $_.Name -ne 'bidshield-ai-platform-complete.zip' -and
    $_.Name -ne 'bidcompliance-ai-platform-complete.zip'
}

Write-Host "Creating ZIP Archive..."
Compress-Archive -Path $items.FullName -DestinationPath $targetZip1 -CompressionLevel Optimal
Copy-Item $targetZip1 $publicZip -Force

$fileInfo = Get-Item $targetZip1
$sizeInMb = [math]::Round($fileInfo.Length / 1MB, 2)

Write-Host "ZIP Archive created successfully!"
Write-Host "Local Path: $targetZip1 ($sizeInMb MB)"
Write-Host "Browser Download: http://localhost:3000/bidshield-ai-platform-complete.zip"
