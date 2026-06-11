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
# newest AppImage (by mtime) — avoids patching a stale older-version artifact
APPIMAGE="$(ls -t "$ROOT"/dist/*.AppImage 2>/dev/null | head -1 || true)"
[ -z "$APPIMAGE" ] && { echo "fix-appimage: no .AppImage in dist/"; exit 1; }

CACHE="$HOME/.cache/electron-builder/appimage"
MK="$(ls "$CACHE"/*/linux-x64/mksquashfs 2>/dev/null | sort | tail -1 || true)"
RT="$(ls "$CACHE"/*/runtime-x64 2>/dev/null | sort | tail -1 || true)"
{ [ -z "$MK" ] || [ -z "$RT" ]; } && { echo "fix-appimage: mksquashfs/runtime not found under $CACHE"; exit 1; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK"
"$APPIMAGE" --appimage-extract >/dev/null

# Bake the runtime flags into AppRun so EVERY AppImage launch (raw double-click,
# self-installed .desktop, etc.) gets them:
#   --no-sandbox            sandbox can't start on Ubuntu 24.04
#   --class=claude-code-desktop   Wayland/X11 app_id -> GNOME resolves the icon
#   --ozone-platform=x11    XWayland; native-Wayland Ozone clipboard doesn't sync
#                           with the system clipboard (breaks copy/paste)
if ! grep -q -- '--ozone-platform=x11' squashfs-root/AppRun; then
  sed -i 's#exec "$BIN"#exec "$BIN" --no-sandbox --class=claude-code-desktop --ozone-platform=x11#g' squashfs-root/AppRun
fi

"$MK" squashfs-root app.sqfs -root-owned -noappend -comp gzip -no-progress >/dev/null
cat "$RT" app.sqfs > "$APPIMAGE"
chmod +x "$APPIMAGE"
echo "fix-appimage: patched $(basename "$APPIMAGE") (raw double-click now launches with --no-sandbox)"
