# Corruption Free India

A source-linked community video and citizen-information site with account creation, creator profiles, video publishing, likes, comments, follows, saved videos, search, and publisher-attributed news discovery.

## Run locally

Open `index.html` in a browser. Search, news and YouTube discovery require an internet connection. Supabase-backed accounts and social features require the setup in `social-feed-setup.sql`.

## Deploy to Netlify

Deploy this folder as the site root so Netlify reads `netlify.toml` and applies the security headers. Do not upload the surrounding Desktop folder.

The Content Security Policy allows the existing Tailwind CDN build, which requires `unsafe-eval`, and inline scripts/styles. These compatibility exceptions weaken the protection CSP can provide against script injection. Replace the CDN build with locally compiled Tailwind and externalize scripts/styles before tightening the policy.

## Supabase

`index.html` uses a Supabase publishable key, which is intended for browser use. Never put a `service_role` key or other secret in this static site.

1. Run `social-feed-setup.sql` in the linked Supabase SQL Editor to create profiles, videos, likes, comments, follows, saves, row-level security policies, and the video bucket.
2. In Supabase Authentication settings, enable email/password sign-in, set the site URL to `https://corruption-free-india.netlify.app`, and allow that site URL as an email confirmation redirect.
3. Create an account on the site and confirm the email if Supabase requires it.

The community feed supports public video posts, likes, comments, creator follows, and saved videos. Production operation still needs human moderation and server-side abuse controls.

## Privacy and reporting limitations

The report form is a local demonstration. It stores submitted fields in the current browser's local storage and does not deliver reports to an authority or provide encrypted/confidential reporting. Direct real incidents to an official agency channel.

## News and video sourcing

News headlines and excerpts are publisher-reported and link to the original source. The external RSS conversion service can rate-limit requests. Video discovery opens live YouTube search results; external videos remain with their publishers and are embedded only when a signed-in user shares a supported URL. Do not download or republish footage without permission. Community posts and comments are public; do not include private information.

## License

This source is licensed under the MIT License; see `LICENSE`. The public repository is [rohitdewan776-sketch/corruption-free-india](https://github.com/rohitdewan776-sketch/corruption-free-india).
