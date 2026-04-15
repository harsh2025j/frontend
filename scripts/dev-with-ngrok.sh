#!/usr/bin/env bash
# npm run dev:ngrok  start ngrok command 
#if ngrok not need in frontend then remove this file  and this line in pacage.json  =>  "dev:ngrok": "./scripts/dev-with-ngrok.sh"

set -euo pipefail

HARDCODED_NGROK_AUTHTOKEN="3CNo0tlXthaXF50wiI5eNzlLNhW_3iGkprPR8bYwDHGLX6ggd"

# Load frontend .env so NGROK_AUTHTOKEN and other vars are available in this shell script.
if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

PORT="${FRONTEND_PORT:-3000}"

if [[ -z "${NGROK_AUTHTOKEN:-}" ]]; then
  NGROK_AUTHTOKEN="$HARDCODED_NGROK_AUTHTOKEN"
fi

start_ngrok() {
  local use_domain="$1"
  local cmd=(
    npx ngrok http "$PORT"
    --authtoken "$NGROK_AUTHTOKEN"
    --log stdout
    --log-format logfmt
  )

  if [[ "$use_domain" == "true" ]] && [[ -n "${FRONTEND_NGROK_DOMAIN:-}" ]]; then
    cmd+=(--domain "$FRONTEND_NGROK_DOMAIN")
  fi

  "${cmd[@]}" >/tmp/frontend-ngrok.log 2>&1 &
  NGROK_PID=$!
}

USE_DOMAIN="false"
if [[ -n "${FRONTEND_NGROK_DOMAIN:-}" ]]; then
  USE_DOMAIN="true"
fi

start_ngrok "$USE_DOMAIN"

cleanup() {
  if kill -0 "$NGROK_PID" >/dev/null 2>&1; then
    kill "$NGROK_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

sleep 2

if ! kill -0 "$NGROK_PID" >/dev/null 2>&1; then
  if [[ "$USE_DOMAIN" == "true" ]] && grep -q "ERR_NGROK_334" /tmp/frontend-ngrok.log; then
    echo "Requested domain is already online. Retrying frontend tunnel with a random URL..."
    start_ngrok "false"
    sleep 2
  fi
fi

if ! kill -0 "$NGROK_PID" >/dev/null 2>&1; then
  echo "Failed to start ngrok. Check /tmp/frontend-ngrok.log"
  exit 1
fi

echo "ngrok started for frontend on port $PORT"

echo "ngrok tunnel details (if available):"
FRONTEND_URL="$(sed -n 's/.*url=\(https:[^ ]*\).*/\1/p' /tmp/frontend-ngrok.log | tail -n 1 || true)"
if [[ -z "$FRONTEND_URL" ]]; then
  FRONTEND_URL="$(grep -Eo 'https://[^ ]*ngrok[^ ]*' /tmp/frontend-ngrok.log | tail -n 1 || true)"
fi
if [[ -n "$FRONTEND_URL" ]]; then
  echo "Frontend URL: $FRONTEND_URL"
else
  echo "Could not read frontend ngrok URL from logs."
  echo "Check /tmp/frontend-ngrok.log (possible free-tier single-session limit)."
fi

echo "Starting Next.js dev server..."

# Turbopack can hit Linux inotify limits on some machines.
# Default to classic Next dev here; set FRONTEND_USE_TURBOPACK=true to opt in.
if [[ "${FRONTEND_USE_TURBOPACK:-false}" == "true" ]]; then
  npx next dev --turbopack --port "$PORT"
else
  npx next dev --port "$PORT"
fi
