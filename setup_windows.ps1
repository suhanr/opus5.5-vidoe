# One-time setup on Windows (run in PowerShell from the repo folder):
#   powershell -ExecutionPolicy Bypass -File setup_windows.ps1
$ErrorActionPreference = "Stop"
Write-Host "== 1/5 Installing Python, Node.js, FFmpeg, Git (skips what is already installed)"
foreach ($id in @("Python.Python.3.12", "OpenJS.NodeJS.LTS", "Gyan.FFmpeg", "Git.Git")) {
  winget install --id $id -e --accept-source-agreements --accept-package-agreements --silent 2>$null | Out-Null
}
# make the new tools visible in this window
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "== 2/5 Python packages"
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Write-Host "== 3/5 Node packages + Chromium for rendering"
npm install
npx playwright install chromium

Write-Host "== 4/5 Voice model (about 350 MB, once)"
New-Item -ItemType Directory -Force -Path models | Out-Null
$base = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
foreach ($f in @("kokoro-v1.0.onnx", "voices-v1.0.bin")) {
  if (-not (Test-Path "models\$f")) { Invoke-WebRequest "$base/$f" -OutFile "models\$f" }
}

Write-Host "== 5/5 Test: building the sample episode (takes a few minutes)"
python engine\build.py episodes\2026-11-20-infinite-scroll
Write-Host "Done. Open episodes\2026-11-20-infinite-scroll\final\ to see the video."
