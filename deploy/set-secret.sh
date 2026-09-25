#!/usr/bin/env bash
# Set one secret in .env.local safely. Run as root on the server:
#   bash /var/www/eldava/deploy/set-secret.sh STRIPE_SECRET_KEY
#
# Why a script rather than an editor:
#   - the value is typed into a hidden prompt, so it never reaches shell history
#   - whitespace and stray quotes from a paste are stripped, and a value pasted
#     across several lines cannot silently break the file
#   - the shape is checked BEFORE writing, so a publishable key, a capitalised
#     "Sk_Live_" or a truncated paste is rejected here instead of failing at
#     checkout hours later
#   - the previous file is kept as .env.local.bak
set -euo pipefail

FILE="${ENV_FILE:-/var/www/eldava/.env.local}"
NAME="${1:-}"
[ -n "$NAME" ] || { echo "usage: set-secret.sh <NAME>   e.g. STRIPE_SECRET_KEY"; exit 1; }

read -rs -p "Paste the value for $NAME (it will not be shown), then press Enter: " VALUE
echo
# No secret used here contains whitespace; a wrapped paste is still correct.
VALUE="$(printf '%s' "$VALUE" | tr -d '[:space:]' | sed 's/^"//; s/"$//; s/^'"'"'//; s/'"'"'$//')"
[ -n "$VALUE" ] || { echo "Nothing entered - no change made."; exit 1; }

reject() { echo; echo "REJECTED: $1"; echo "You entered: ${VALUE:0:8}… (${#VALUE} characters). Nothing was changed."; exit 1; }

case "$NAME" in
  STRIPE_SECRET_KEY)
    case "$VALUE" in
      pk_*) reject "that is the publishable key (pk_…), which is for the browser. Use the SECRET key from Developers -> API keys." ;;
      sk_live_*|sk_test_*|rk_live_*|rk_test_*) : ;;
      [Ss][Kk]_*|[Rr][Kk]_*) reject "the prefix is capitalised. Stripe keys are entirely lowercase - this was retyped rather than copied, so other characters (0/O, l/1) are probably wrong too. Use the copy button in the Stripe Dashboard." ;;
      *) reject "that does not look like a Stripe secret key (expected sk_live_…, sk_test_… or rk_…)." ;;
    esac
    [ "${#VALUE}" -ge 30 ] || reject "the key looks truncated (${#VALUE} characters; a Stripe key is around 100)."
    ;;
  STRIPE_WEBHOOK_SECRET)
    case "$VALUE" in whsec_*) : ;; *) reject "a webhook signing secret starts with whsec_." ;; esac
    ;;
  ANTHROPIC_API_KEY)
    case "$VALUE" in sk-ant-*) : ;; *) reject "an Anthropic API key starts with sk-ant-." ;; esac
    ;;
esac

touch "$FILE"
cp -p "$FILE" "$FILE.bak"
# The value goes through the environment, not the command line, so it is never
# visible in `ps` output while this runs.
NAME="$NAME" VALUE="$VALUE" awk '
  BEGIN { n = ENVIRON["NAME"]; v = ENVIRON["VALUE"]; done = 0 }
  $0 ~ "^" n "=" { print n "=\"" v "\""; done = 1; next }
  { print }
  END { if (!done) print n "=\"" v "\"" }
' "$FILE" > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
chown eldava:eldava "$FILE" 2>/dev/null || true
chmod 600 "$FILE"

echo "Set $NAME = ${VALUE:0:11}…${VALUE: -4} (${#VALUE} characters). Previous file kept at $FILE.bak"
echo
echo "Apply it:  sudo -iu eldava pm2 restart eldava --update-env"
echo "Then check Admin -> Dashboard -> System status."
