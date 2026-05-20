#!/bin/sh
set -eu

APP_BASE_HREF="${APP_BASE_HREF:-/}"
API_BASE_URL="${API_BASE_URL:-/api}"
LOGIN_URL="${LOGIN_URL:-}"
LOGOUT_URL="${LOGOUT_URL:-}"
WEB_ROOT="${WEB_ROOT:-/usr/share/nginx/html}"

case "$APP_BASE_HREF" in
  /*) ;;
  *) APP_BASE_HREF="/$APP_BASE_HREF" ;;
esac

case "$APP_BASE_HREF" in
  */) ;;
  *) APP_BASE_HREF="$APP_BASE_HREF/" ;;
esac

case "$API_BASE_URL" in
  */) API_BASE_URL="${API_BASE_URL%/}" ;;
esac

LOGIN_URL="${LOGIN_URL:-$API_BASE_URL/oauth2/authorization/eosc}"
LOGOUT_URL="${LOGOUT_URL:-$API_BASE_URL/logout}"

escape_sed_replacement() {
  printf '%s' "$1" | sed 's/[&\]/\\&/g'
}

escape_json_string() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

escaped_base_href="$(escape_sed_replacement "$APP_BASE_HREF")"
sed -i "s|%APP_BASE_HREF%|$escaped_base_href|g" "$WEB_ROOT/index.html"

cat > "$WEB_ROOT/config.json" <<EOF
{
  "apiBaseUrl": "$(escape_json_string "$API_BASE_URL")",
  "loginUrl": "$(escape_json_string "$LOGIN_URL")",
  "logoutUrl": "$(escape_json_string "$LOGOUT_URL")"
}
EOF
