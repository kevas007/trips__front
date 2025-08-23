# Script de test pour l'upload de photos
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU5ODI1NzksImlhdCI6MTc1NTg5NjE3OSwic3ViIjoiODJmY2VhY2MtM2NmZS00MzRmLTgwMGQtMzBlM2ViNjcxYzkwIn0.TcShgjM7mB2NUZIX4jrd2sk84oGW3ZQp9mrERxeUPpg"
$tripId = "1e5100e5-7022-480e-a2f1-dbce29557a55"

# Créer un fichier de test
"Test image content" | Out-File -FilePath "test-image.txt" -Encoding UTF8

# Créer FormData
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"photo`"; filename=`"test-image.txt`"",
    "Content-Type: text/plain",
    "",
    (Get-Content "test-image.txt" -Raw),
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
    $response = Invoke-WebRequest -Uri "http://localhost:8085/api/v1/trips/$tripId/photos" -Method POST -Body $bodyLines -Headers $headers
    Write-Host "✅ Succès: $($response.StatusCode)"
    Write-Host $response.Content
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}
