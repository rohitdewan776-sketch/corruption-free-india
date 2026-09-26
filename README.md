# Corruption Free India

A static citizen-information demo with site-wide search, publisher-attributed news discovery, and community video links.

## Run locally

Open `index.html` in a browser. The news converter and Supabase features require an internet connection. Search also indexes content loaded in the current page.

## Deploy to Netlify

Deploy this folder as the site root so Netlify reads `netlify.toml` and applies the security headers. Do not upload the surrounding Desktop folder.

The Content Security Policy allows the existing Tailwind CDN build, which requires `unsafe-eval`, and inline scripts/styles. These compatibility exceptions weaken the protection CSP can provide against script injection. Replace the CDN build with locally compiled Tailwind and externalize scripts/styles before tightening the policy.

## Supabase

`index.html` uses a Supabase publishable key, which is intended for browser use. Never put a `service_role` key or other secret in this static site. Apply the SQL shown in the video feed only after reviewing it. Public visitors have read-only access; publishing requires a signed-in Supabase user. This page does not yet include sign-in, and storage upload policies should remain disabled until authentication, moderation, and server-side abuse controls are configured.

## Privacy and reporting limitations

The report form is a local demonstration. It stores submitted fields in the current browser's local storage and does not deliver reports to an authority or provide encrypted/confidential reporting. Direct real incidents to an official agency channel.

## News and video sourcing

News headlines and excerpts are publisher-reported and link to the original source. The external RSS conversion service can rate-limit requests. Video discovery opens live YouTube search results; external videos remain with their publishers and are embedded only when a user shares a supported URL. Do not download or republish footage without permission.

## License

This source is licensed under the MIT License; see `LICENSE`. The public repository is [rohitdewan776-sketch/corruption-free-india](https://github.com/rohitdewan776-sketch/corruption-free-india).
