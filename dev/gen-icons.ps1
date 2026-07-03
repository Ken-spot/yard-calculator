# Generates the app icons (grass over a paver patio) using GDI+.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File dev\gen-icons.ps1
Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $PSScriptRoot '..\icons'
if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir | Out-Null }

function New-Icon([int]$size, [string]$outPath) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $s = $size / 512.0   # scale factor from the 512 design

  $bgGreen   = [System.Drawing.Color]::FromArgb(46, 125, 50)
  $bladeA    = [System.Drawing.Color]::FromArgb(129, 199, 132)
  $bladeB    = [System.Drawing.Color]::FromArgb(174, 220, 170)
  $paver     = [System.Drawing.Color]::FromArgb(207, 197, 184)
  $paverAlt  = [System.Drawing.Color]::FromArgb(190, 179, 165)

  $g.Clear($bgGreen)

  # --- paver patio (bottom), running-bond pattern ---
  $paverBrushA = New-Object System.Drawing.SolidBrush($paver)
  $paverBrushB = New-Object System.Drawing.SolidBrush($paverAlt)
  $gap = 12; $brickW = 140; $brickH = 62; $topY = 300
  $row = 0
  for ($y = $topY; $y -lt 512; $y += $brickH + $gap) {
    $offset = if ($row % 2 -eq 0) { 0 } else { - [int]($brickW / 2) }
    $col = 0
    for ($x = $offset; $x -lt 512; $x += $brickW + $gap) {
      $brush = if (($row + $col) % 2 -eq 0) { $paverBrushA } else { $paverBrushB }
      $g.FillRectangle($brush, [float]($x * $s), [float]($y * $s), [float]($brickW * $s), [float]([Math]::Min($brickH, 512 - $y) * $s))
      $col++
    }
    $row++
  }

  # --- grass blades along the top of the patio ---
  $bladeBrushA = New-Object System.Drawing.SolidBrush($bladeA)
  $bladeBrushB = New-Object System.Drawing.SolidBrush($bladeB)
  $baseY = 308
  $i = 0
  for ($x = 10; $x -lt 500; $x += 44) {
    $h = if ($i % 3 -eq 0) { 150 } elseif ($i % 3 -eq 1) { 110 } else { 130 }
    $lean = if ($i % 2 -eq 0) { 10 } else { -12 }
    $pts = @(
      (New-Object System.Drawing.PointF([float]($x * $s), [float]($baseY * $s))),
      (New-Object System.Drawing.PointF([float](($x + 17 + $lean) * $s), [float](($baseY - $h) * $s))),
      (New-Object System.Drawing.PointF([float](($x + 34) * $s), [float]($baseY * $s)))
    )
    $brush = if ($i % 2 -eq 0) { $bladeBrushA } else { $bladeBrushB }
    $g.FillPolygon($brush, $pts)
    $i++
  }

  $g.Dispose()
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "Wrote $outPath ($size x $size)"
}

New-Icon 512 (Join-Path $iconsDir 'icon-512.png')
New-Icon 192 (Join-Path $iconsDir 'icon-192.png')
New-Icon 180 (Join-Path $iconsDir 'apple-touch-icon.png')
