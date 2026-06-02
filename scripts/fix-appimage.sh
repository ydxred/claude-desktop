#!/usr/bin/env bash
# Post-process the electron-builder AppImage so it launches with --no-sandbox
# on a raw double-click too.
#
# Why: on Ubuntu 24.04 the bundled chrome-sandbox isn't setuid-root (and
# unprivileged user namespaces are restricted), so Chromium's sandbox can't
# start. electron-builder's `executableArgs` only adds --no-sandbox to the
# .desktop `Exec` line (used by menu/desktop-integration launches), NOT to the
# AppImage's internal AppRun. So a raw `./App.AppImage` run still aborts. This
# patches AppRun to always pass --no-sandbox, then repacks the AppImage using
# the same mksquashfs + runtime electron-builder already downloaded.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPIMAGE="$(ls "$ROOT"/dist/*.AppImage 2>/dev/null | head -1 || true)"
[ -z "$APPIMAGE" ] && { echo "fix-appimage: no .AppImage in dist/"; exit 1; }

CACHE="$HOME/.cache/electron-builder/appimage"
MK="$(ls "$CACHE"/*/linux-x64/mksquashfs 2>/dev/null | sort | tail -1 || true)"
RT="$(ls "$CACHE"/*/runtime-x64 2>/dev/null | sort | tail -1 || true)"
{ [ -z "$MK" ] || [ -z "$RT" ]; } && { echo "fix-appimage: mksquashfs/runtime not found under $CACHE"; exit 1; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK"
"$APPIMAGE" --appimage-extract >/dev/null

# Pass both --no-sandbox (sandbox can't start on Ubuntu 24.04) and
# --class=claude-code-desktop (sets the Wayland app_id so GNOME resolves the
# app icon via claude-code-desktop.desktop) on a raw AppImage launch too.
if ! grep -q -- '--class=claude-code-desktop' squashfs-root/AppRun; then
  sed -i 's#exec "$BIN"#exec "$BIN" --no-sandbox --class=claude-code-desktop#g' squashfs-root/AppRun
fi

"$MK" squashfs-root app.sqfs -root-owned -noappend -comp gzip -no-progress >/dev/null
cat "$RT" app.sqfs > "$APPIMAGE"
chmod +x "$APPIMAGE"
echo "fix-appimage: patched $(basename "$APPIMAGE") (raw double-click now launches with --no-sandbox)"
