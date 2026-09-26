# Security notes

This static site cannot guarantee that it is unhackable. Browser code, public third-party services, deployment configuration, and Supabase policies all affect its security.

## Current protections and limitations

- `netlify.toml` configures HTTPS transport and response security headers, including a Content Security Policy.
- The current Tailwind CDN and inline scripts require CSP exceptions (`unsafe-eval` and `unsafe-inline`); these reduce the protection CSP provides against injected scripts.
- The Supabase publishable key is public by design. Database row checks validate some fields but do not provide abuse prevention, moderation, authentication, or per-user rate limits.
- Anonymous reports are stored only in the local browser and are not sent securely to an authority.
- The RSS conversion service and third-party video providers are external dependencies.

## Before production use

Replace CDN-delivered Tailwind with a locally built stylesheet, move scripts out of inline blocks, tighten CSP, add server-side rate limits and moderation for community submissions, and review Supabase row-level and storage policies. Use an official, secure reporting platform for confidential incident reports.

## Reporting a vulnerability

Report security issues privately to the repository owner using GitHub's private vulnerability-reporting feature if enabled. Otherwise contact the owner through their GitHub profile. Do not post credentials, private incident data, or exploit details in a public issue.
