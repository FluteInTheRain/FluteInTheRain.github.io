#!/bin/sh
set -e

INSTALL=0
DISCARD=0
LOCK_ONLY=0

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Updates astro, tailwindcss, and @tailwindcss/vite to their latest versions
and rewrites package.json + package-lock.json via a throwaway Docker container.

Options:
  -i, --install     Install packages and leave node_modules on the host
  -d, --discard     Install and verify, then remove node_modules from the host
  -l, --lock-only   Update package.json + package-lock.json only (no node_modules
                    written to host, skips vite verification)
  -h, --help        Show this help message and exit

Note:
  -d and -l are mutually exclusive -- passing both will exit with an error.

Default behaviour (no flags):
  Show this help message.
EOF
}

for arg in "$@"; do
  case "$arg" in
    -i|--install)   INSTALL=1 ;;
    -d|--discard)   DISCARD=1 ;;
    -l|--lock-only) LOCK_ONLY=1 ;;
    -h|--help)      usage; exit 0 ;;
    *)
      echo "Unknown option: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [ "$INSTALL" -eq 0 ] && [ "$DISCARD" -eq 0 ] && [ "$LOCK_ONLY" -eq 0 ]; then
  usage
  exit 0
fi

if [ "$DISCARD" -eq 1 ] && [ "$LOCK_ONLY" -eq 1 ]; then
  echo "Error: --discard and --lock-only are mutually exclusive." >&2
  exit 1
fi

if [ "$LOCK_ONLY" -eq 1 ]; then
  CMD="npm install --package-lock-only astro@latest tailwindcss@latest @tailwindcss/vite@latest"
elif [ "$DISCARD" -eq 1 ]; then
  CMD="npm install astro@latest tailwindcss@latest @tailwindcss/vite@latest && npm ls vite && rm -rf node_modules"
else
  CMD="npm install astro@latest tailwindcss@latest @tailwindcss/vite@latest && npm ls vite"
fi

docker run --rm -v "$(pwd):/app:z" -w /app --user "$(id -u):$(id -g)" \
  -e npm_config_cache=/tmp/npm-cache \
  node:22-alpine \
  sh -c "$CMD"
