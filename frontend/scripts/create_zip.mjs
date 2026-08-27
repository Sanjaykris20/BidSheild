import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const destZip = 'C:\\Users\\sadha\\Downloads\\bidcompliance-ai-platform-complete.zip';
console.log('Target zip file location:', destZip);

const psScript = `
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
$dest = 'C:\\Users\\sadha\\Downloads\\bidcompliance-ai-platform-complete.zip'
if (Test-Path $dest) { Remove-Item $dest -Force }
Compress-Archive -Path $items -DestinationPath $dest -CompressionLevel Optimal
`;

fs.writeFileSync('scripts/zip_task.ps1', psScript);
execSync('powershell -ExecutionPolicy Bypass -File scripts/zip_task.ps1', { stdio: 'inherit' });
fs.unlinkSync('scripts/zip_task.ps1');

if (fs.existsSync(destZip)) {
  const stats = fs.statSync(destZip);
  console.log(`\nZIP CREATED SUCCESSFULLY!`);
  console.log(`Path: ${destZip}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(2)} KB`);
}
