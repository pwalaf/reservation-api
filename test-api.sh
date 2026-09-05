#!/usr/bin/env bash
# Script de test end-to-end pour l'API de réservations.
# Prérequis : le serveur tourne (npm run dev) et la base a été seedée (npm run seed).
set -uo pipefail

BASE_URL="http://localhost:4000"
API="$BASE_URL/api/reservations"

separator() { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }

# Extrait un champ JSON depuis stdin sans dépendance externe (jq peut manquer).
json_field() {
  node -e "
    let d = '';
    process.stdin.on('data', c => d += c).on('end', () => {
      try { console.log(JSON.parse(d)$1 ?? ''); } catch { console.log(''); }
    });
  "
}

separator "Health check"
curl -s -w '\n[HTTP %{http_code}]\n' "$BASE_URL/health"

separator "Création — réservation valide"
CREATE_BODY='{
  "clientName": "Test Script",
  "clientPhone": "034 00 000 00",
  "roomType": "double",
  "checkIn": "2026-10-01",
  "checkOut": "2026-10-03",
  "status": "confirmee",
  "amount": 150000
}'
CREATE_RESPONSE=$(curl -s -X POST "$API" -H "Content-Type: application/json" -d "$CREATE_BODY")
echo "$CREATE_RESPONSE"
ID=$(echo "$CREATE_RESPONSE" | json_field "._id")
if [ -z "$ID" ]; then
  echo "⚠️  Échec de création — arrêt du script (vérifie que le serveur tourne et que MONGODB_URI est correct)"
  exit 1
fi
echo "→ id créé: $ID"

separator "Validation — checkOut avant checkIn (doit être 400)"
curl -s -w '\n[HTTP %{http_code}]\n' -X POST "$API" -H "Content-Type: application/json" -d '{
  "clientName": "Cas invalide",
  "roomType": "double",
  "checkIn": "2026-10-05",
  "checkOut": "2026-10-01",
  "amount": 50000
}'

separator "Validation — champ obligatoire manquant (doit être 400)"
curl -s -w '\n[HTTP %{http_code}]\n' -X POST "$API" -H "Content-Type: application/json" -d '{
  "roomType": "double",
  "checkIn": "2026-10-01",
  "checkOut": "2026-10-03",
  "amount": 50000
}'

separator "Liste complète"
curl -s -w '\n[HTTP %{http_code}]\n' "$API"

separator "Liste filtrée — status=confirmee"
curl -s -w '\n[HTTP %{http_code}]\n' "$API?status=confirmee"

separator "Liste filtrée — roomType=suite"
curl -s -w '\n[HTTP %{http_code}]\n' "$API?roomType=suite"

separator "Détail par id"
curl -s -w '\n[HTTP %{http_code}]\n' "$API/$ID"

separator "Détail — id invalide (doit être 400)"
curl -s -w '\n[HTTP %{http_code}]\n' "$API/ceci-n-est-pas-un-id"

separator "Détail — id inexistant mais bien formé (doit être 404)"
curl -s -w '\n[HTTP %{http_code}]\n' "$API/000000000000000000000000"

separator "Update — changement de statut uniquement"
curl -s -w '\n[HTTP %{http_code}]\n' -X PATCH "$API/$ID" -H "Content-Type: application/json" -d '{"status": "annulee"}'

separator "Stats — revenu/mois, occupation par type, chambre la plus demandée"
curl -s -w '\n[HTTP %{http_code}]\n' "$API/stats"

separator "Suppression"
curl -s -w '\n[HTTP %{http_code}]\n' -X DELETE "$API/$ID"

separator "Get après suppression (doit être 404)"
curl -s -w '\n[HTTP %{http_code}]\n' "$API/$ID"

separator "Terminé"
echo "Vérifie ci-dessus : les codes 400/404 attendus sont bien ceux marqués comme tels dans les titres."
