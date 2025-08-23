# Test d'upload de photo
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU5ODMwMjAsImlhdCI6MTc1NTg5NjYyMCwic3ViIjoiMzU3YWUyZDQtOTZkNC00Njc4LTk1NjYtODMzMzJjMDEzMGVjIn0.UE3xtEi5GzgG24fb1J9p6VCaXdWvJdcL4AwkGLS2lxU"
$tripId = "bee43bdb-4f8e-4b76-bf0c-d279b8888c37"

Write-Host "🔍 Test d'upload de photo pour le voyage: $tripId"

# Créer un fichier de test
"Fake image data for testing" | Out-File -FilePath "test-image.jpg" -Encoding UTF8

# Créer FormData avec PowerShell
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"photo`"; filename=`"test-image.jpg`"",
    "Content-Type: image/jpeg",
    "",
    (Get-Content "test-image.jpg" -Raw),
    "--$boundary",
    "Content-Disposition: form-data; name=`"description`"",
    "",
    "Test photo description",
    "--$boundary",
    "Content-Disposition: form-data; name=`"title`"",
    "",
    "Test photo title",
    "--$boundary",
    "Content-Disposition: form-data; name=`"featured`"",
    "",
    "false",
    "--$boundary--"
) -join $LF

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

try {
    Write-Host "📤 Tentative d'upload..."
    $response = Invoke-WebRequest -Uri "http://localhost:8085/api/v1/trips/$tripId/photos" -Method POST -Body $bodyLines -Headers $headers
    Write-Host "✅ Succès: $($response.StatusCode)"
    Write-Host "📄 Response: $($response.Content)"
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📄 Response: $responseBody"
    }
}
