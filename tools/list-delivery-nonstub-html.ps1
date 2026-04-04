$delivery = Join-Path (Split-Path -Parent $PSScriptRoot) 'delivery'
Get-ChildItem -Path $delivery -Recurse -Filter *.html -File | ForEach-Object {
    $raw = [IO.File]::ReadAllText($_.FullName, [Text.Encoding]::UTF8)
    # Titulo do stub sem depender de acentos no script (encoding do ficheiro .ps1)
    if ($raw -notmatch 'migrada para a loja oficial') {
        $_.FullName
    }
}
