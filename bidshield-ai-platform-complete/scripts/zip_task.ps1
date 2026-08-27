
$items = @(
  'src',
  'scripts',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tailwind.config.js',
  'postcss.config.js',
  'next.config.js',
  'walkthrough.md',
  'README.md',
  'bidcompliance_ai_platform.html'
)
$dest = 'C:\Users\sadha\Downloads\bidcompliance-ai-platform-complete.zip'
if (Test-Path $dest) { Remove-Item $dest -Force }
Compress-Archive -Path $items -DestinationPath $dest -CompressionLevel Optimal
