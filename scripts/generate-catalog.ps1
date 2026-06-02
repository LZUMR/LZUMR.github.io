$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$rootPath = $root.Path.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
function Convert-ToWebPath {
  param([string] $Path)
  return ($Path -replace "\\", "/")
}

function Get-FileType {
  param([string] $Extension)
  if ([string]::IsNullOrWhiteSpace($Extension)) {
    return "file"
  }
  return $Extension.TrimStart(".").ToLowerInvariant()
}

$subjects = Get-ChildItem -LiteralPath $root -Directory |
  Where-Object { $_.Name -notin @(".git", ".agents", ".codex", "scripts") } |
  Sort-Object Name |
  ForEach-Object {
    $subject = $_
    $files = Get-ChildItem -LiteralPath $subject.FullName -File -Recurse |
      Sort-Object FullName |
      ForEach-Object {
        $relative = $_.FullName.Substring($rootPath.Length)
        [ordered]@{
          name = $_.Name
          path = Convert-ToWebPath $relative
          type = Get-FileType $_.Extension
        }
      }

    [ordered]@{
      name = $subject.Name
      description = "$($subject.Name) course resources"
      files = @($files)
    }
  }

$json = $subjects | ConvertTo-Json -Depth 6
$content = "window.RESOURCE_CATALOG = $json;`n"
Set-Content -LiteralPath (Join-Path $root "catalog.js") -Value $content -Encoding utf8
