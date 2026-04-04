param([string]$f = "d:\dev\caracore-site\index.html")
$b = [IO.File]::ReadAllBytes($f)
$t = [Text.Encoding]::UTF8.GetString($b)
$i = $t.IndexOf("<meta charset")
Write-Host "Charset meta string index (UTF-16 chars): $i"
# UTF-8 byte offset: approximate
$before = [Text.Encoding]::UTF8.GetBytes($t.Substring(0, $i))
Write-Host "Approx UTF-8 bytes before charset meta: $($before.Length)"
Write-Host "Within first 1024 bytes: $($before.Length -lt 1024)"
