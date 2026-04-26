$file = "src\pages\NutritionGuide.tsx"
$lines = Get-Content $file
$totalLines = $lines.Count
Write-Host "Total lines before: $totalLines"
# Keep lines 1-644 (index 0-643) and lines 988 onwards (index 987+)
$keep = @()
$keep += $lines[0..643]
$keep += $lines[987..($totalLines - 1)]
Set-Content $file $keep -Encoding UTF8
Write-Host "Total lines after: $($keep.Count)"
