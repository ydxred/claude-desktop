#!/usr/bin/env bash
# Install a GNOME desktop launcher so Claude Code Desktop shows up in the app
# grid and can be pinned to the dock / double-clicked. No sudo required
# (installs into the per-user applications dir).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPS="$HOME/.local/share/applications"
DESKTOP="$APPS/claude-code-desktop.desktop"

mkdir -p "$APPS"
cat > "$DESKTOP" <<EOF
[Desktop Entry]
Type=Application
Name=Claude Code Desktop
Comment=Claude Code CLI in a desktop window
Exec=$DIR/run.sh
Icon=$DIR/assets/app-icon.png
Terminal=false
Categories=Development;Utility;
StartupNotify=true
StartupWMClass=claude-code-desktop
EOF

chmod +x "$DESKTOP" "$DIR/run.sh"
# Refresh the desktop database so it appears immediately (best-effort).
command -v update-desktop-database >/dev/null 2>&1 && \
  update-desktop-database "$APPS" >/dev/null 2>&1 || true

echo "Installed launcher: $DESKTOP"
echo "Search 'Claude Code' in Activities, or pin it to the dock."
