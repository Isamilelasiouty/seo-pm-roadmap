# Assembly script for SEO to PM Roadmap HTML files
$ErrorActionPreference = "Stop"

$head = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO to Product Management: The Dual-Competency Learning Roadmap &amp; AI Diagnostic Tool</title>
  <meta name="description" content="A comprehensive, interactive 12-week roadmap for SEO professionals transitioning into Product Management. Master 7 core competencies, explore interactive system architectures, study masterclass articles, read ranked PM books, and build an AI-powered SEO diagnostic assistant.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
"@

$css = Get-Content "styles.css" -Raw

$mid = @"
  </style>
</head>
<body>
"@

$sections = @(
  "header_and_overview.html",
  "roadmap_weeks.html",
  "competencies.html",
  "diagrams_and_architecture.html",
  "articles.html",
  "video_masterclasses.html",
  "books_library.html",
  "capstone.html",
  "resources.html",
  "english_and_glossary.html",
  "dashboard_and_guidance.html"
)

$bodyContent = ""
foreach ($sec in $sections) {
  if (Test-Path $sec) {
    Write-Host "Appending $sec..."
    $content = Get-Content $sec -Raw
    $bodyContent += "`n" + $content + "`n"
  } else {
    Write-Error "Missing section file: $sec"
  }
}

$js = Get-Content "app.js" -Raw

$tail = @"
<script>
$js
</script>
</body>
</html>
"@

$fullHtml = $head + "`n" + $css + "`n" + $mid + "`n" + $bodyContent + "`n" + $tail

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

[System.IO.File]::WriteAllText((Join-Path (Get-Location) "index.html"), $fullHtml, $utf8NoBom)
[System.IO.File]::WriteAllText((Join-Path (Get-Location) "seo_product_management_learning_roadmap.html"), $fullHtml, $utf8NoBom)

Write-Host "Successfully generated index.html and seo_product_management_learning_roadmap.html!"
$size = (Get-Item "index.html").Length
Write-Host "File size: $size bytes"
