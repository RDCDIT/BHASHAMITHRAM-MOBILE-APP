#!/bin/bash
# ============================================================
#  BHASHAMITHRAM — One-command startup script
#  Run this every time you want to start the app:
#      bash start.sh
# ============================================================

set -e
BASE="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$BASE/backend"
FRONTEND="$BASE/Mobile_app"
ENV_FILE="$FRONTEND/.env"

# ── 1. Find the current LAN IP ─────────────────────────────
LAN_IP=$(ip addr show 2>/dev/null \
  | grep "inet " \
  | grep -v "127.0.0.1" \
  | grep -v "10.42." \
  | awk '{print $2}' \
  | cut -d/ -f1 \
  | head -1)

if [ -z "$LAN_IP" ]; then
  LAN_IP="localhost"
fi

echo ""
echo "==========================================="
echo "  BHASHAMITHRAM STARTUP"
echo "==========================================="
echo "  LAN IP detected : $LAN_IP"
echo "  Backend port    : 5000"
echo "  Frontend port   : 8081"
echo "==========================================="

# ── 2. Update EXPO_PUBLIC_API_URL in Mobile_app/.env ───────
if grep -q "EXPO_PUBLIC_API_URL" "$ENV_FILE" 2>/dev/null; then
  sed -i "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=http://${LAN_IP}:5000|" "$ENV_FILE"
else
  echo "EXPO_PUBLIC_API_URL=http://${LAN_IP}:5000" >> "$ENV_FILE"
fi
echo "  .env updated    : EXPO_PUBLIC_API_URL=http://${LAN_IP}:5000"

# ── 3. Kill any stale processes ─────────────────────────────
pkill -f "node server.js" 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
sleep 1

# ── 4. Start backend ────────────────────────────────────────
echo ""
echo "  Starting backend..."
cd "$BACKEND"
node server.js &
BACKEND_PID=$!
sleep 3

# Quick health check
if curl -sf "http://localhost:5000/api/malayalam-malayalam/browse-malayalam?query=" > /dev/null 2>&1; then
  echo "  Backend: RUNNING (pid $BACKEND_PID)"
else
  echo "  Backend: WARNING — not responding yet, check logs"
fi

# ── 5. Start frontend ───────────────────────────────────────
echo ""
echo "  Starting frontend..."
cd "$FRONTEND"
npx expo start --web --port 8081 --clear &
FRONTEND_PID=$!

echo ""
echo "==========================================="
echo "  App will be ready at:"
echo "    http://localhost:8081      (this machine)"
echo "    http://${LAN_IP}:8081     (LAN / mobile)"
echo "==========================================="
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
