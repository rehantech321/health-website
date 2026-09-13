# Shared proxy headers. The app derives its own URL for Stripe return links
# and emails from X-Forwarded-Proto / X-Forwarded-Host when
# NEXT_PUBLIC_SITE_URL is not set, so these must be accurate.
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header Connection "";
proxy_read_timeout 120s;
