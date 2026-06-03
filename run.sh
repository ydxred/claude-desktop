#!/usr/bin/env bash
# Launch Claude Code Desktop. Resolves its own directory so it works from a
# .desktop launcher (double-click) regardless of the current working dir.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Default to --no-sandbox: on Ubuntu 24.04 the bundled chrome-sandbox is not
# setuid-root and unprivileged user namespaces are restricted by AppArmor, so
# the Chromium sandbox can't initialize. This is a local app running a local
# CLI, so dropping the renderer sandbox is acceptable. To keep the sandbox
# instead, see README ("Keeping the Chromium sandbox") and run with
#   CLAUDE_DESKTOP_FLAGS="" ./run.sh
# Use the real Electron binary (self-contained, bundles its own node) rather
# than node_modules/.bin/electron (a `#!/usr/bin/env node` shim) so launching
# from a GUI/.desktop never depends on a `node` being on PATH.
# --class sets the Wayland app_id / X11 WM_CLASS so GNOME matches the window to
# claude-code-desktop.desktop and shows the app icon in the dock/overview.
exec "$DIR/node_modules/electron/dist/electron" . --class=claude-code-desktop ${CLAUDE_DESKTOP_FLAGS:---no-sandbox} "$@"
