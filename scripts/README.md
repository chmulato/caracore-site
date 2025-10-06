# OIDC interactive login tester (Playwright)

Files:

- test_oidc_login.py - Playwright-based script that opens the site and clicks the Google and Microsoft login buttons, detecting provider sign-in navigation.

Requirements:

- Python 3.8+
- Install Playwright and browsers:
  python -m pip install playwright
  python -m playwright install

Run:
  python scripts/test_oidc_login.py --headless

Notes:

- The script relies on page selectors for the login buttons. If your page uses custom buttons, update the selectors in `click_login_button` inside `scripts/test_oidc_login.py`.
- For CI-friendly checks without GUI, use --headless.
- If you cannot install Playwright, consider the earlier `scripts/validate_oidc_endpoints.py` which uses HTTP-only checks and does not need browsers.
