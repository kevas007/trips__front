$BASE_URL = "http://localhost:8085"
$TRIP_ID = "39476f9a-4f39-41bf-92b0-17a5bedebc54"
$TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU5ODAyMjYsImlhdCI6MTc1NTg5MzgyNiwic3ViIjoiMDlkODFiZDktMmY1YS00NWRhLThhZTEtOTkxOTQ1MDZiNDc4In0.wM8uh6Z6XBCp6Z_Z4_IDyhLObdcYcGTSmpbF1aAS39U"

Write-Host "🔍 Test de l'endpoint GET /trips/:id/photos" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/trips/$TRIP_ID/photos" -Method GET -Headers @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📄 Réponse:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorText = $reader.ReadToEnd()
        Write-Host "📄 Contenu de l'erreur: $errorText" -ForegroundColor Red
    }
}
