This folder contains third-party vendor scripts used as offline/localhost fallbacks.

File: msal-browser.min.js
- Library: @azure/msal-browser
- Version: 3.18.0
- Source CDN options:
  - https://alcdn.msauth.net/browser/3.18.0/js/msal-browser.min.js
  - https://cdn.jsdelivr.net/npm/@azure/msal-browser@3.18.0/lib/msal-browser.min.js
  - https://unpkg.com/@azure/msal-browser@3.18.0/lib/msal-browser.min.js

How to update:
1) Download the exact version you want from an official CDN or npm package.
2) Place the minified file here as `msal-browser.min.js`.
3) Ensure `secure/index.html` and `secure/callback.html` loaders include the proper version in their fallbacks.
4) Consider checking the file integrity yourself.

Note: This repository does not commit the vendor file content automatically to avoid licensing and size issues; add it explicitly if needed for fully offline usage.