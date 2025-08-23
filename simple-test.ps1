# Test simple d'upload de photo
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU5ODI1NzksImlhdCI6MTc1NTg5NjE3OSwic3ViIjoiODJmY2VhY2MtM2NmZS00MzRmLTgwMGQtMzBlM2ViNjcxYzkwIn0.TcShgjM7mB2NUZIX4jrd2sk84oGW3ZQp9mrERxeUPpg"
$tripId = "1e5100e5-7022-480e-a2f1-dbce29557a55"

Write-Host "🔍 Test de l'endpoint de photos pour le voyage: $tripId"

# Test 1: Récupérer les photos existantes
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085/api/v1/trips/$tripId/photos" -Method GET -Headers @{ "Authorization" = "Bearer $token" }
    Write-Host "✅ GET /photos - Status: $($response.StatusCode)"
    Write-Host "📸 Photos existantes: $($response.Content)"
} catch {
    Write-Host "❌ Erreur GET /photos: $($_.Exception.Message)"
}

# Test 2: Vérifier l'endpoint d'upload (sans fichier pour l'instant)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085/api/v1/trips/$tripId/photos" -Method POST -Headers @{ "Authorization" = "Bearer $token" }
    Write-Host "✅ POST /photos - Status: $($response.StatusCode)"
} catch {
    Write-Host "❌ Erreur POST /photos: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "📄 Response: $responseBody"
    }
}
