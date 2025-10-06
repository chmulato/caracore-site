"""
Playwright-based OIDC login tester

This script automates a browser to:
- Open https://www.caracore.com.br/secure/index.html
- Click the "Login with Google" and "Login with Microsoft" buttons (selectors need to be adapted to the page)
- Observe whether the provider sign-in page opens (by capturing the navigation target or popup)
- Report results to stdout

Notes:
- This is a testing tool and cannot bypass actual provider credentials.
- For automated end-to-end checks, you can use test accounts and credential injection, but that requires secure management of credentials.

Usage:
1) Install playwright and browsers:
   python -m pip install playwright
   python -m playwright install

2) Run the script:
   python scripts/test_oidc_login.py --headless

Options:
  --base-url: Base URL to test (default https://www.caracore.com.br)
  --timeout: navigation timeout in seconds
  --headless: run browser headless (flag)

Adjust selectors inside `click_login_button` if necessary to match your page's buttons.
"""
from __future__ import annotations
import argparse
import asyncio
import sys
from typing import Optional

# Playwright import guarded to provide a friendly message if not installed
try:
    from playwright.async_api import async_playwright, Error as PlaywrightError
except Exception as e:
    print("Playwright not installed. Install with: python -m pip install playwright && python -m playwright install")
    raise


async def click_login_button(page, provider: str) -> Optional[str]:
    """Find and click the login button for provider and return the resulting URL (or None)."""
    # Default selectors - may need adaptation
    selectors = {
        'google': "button[data-provider='google'], .btn-google, .login-google, #login-google",
        'microsoft': "button[data-provider='microsoft'], .btn-microsoft, .login-ms, #login-microsoft",
    }

    sel = selectors.get(provider.lower())
    if not sel:
        return None

    # Try to find an element matching any of the comma-separated selectors
    for s in [x.strip() for x in sel.split(',')]:
        try:
            el = await page.query_selector(s)
            if el:
                print(f"Found element for {provider} with selector '{s}'")
                # Monitor for new page (popup) or navigation
                async with page.expect_popup() as popup_info:
                    await el.click()
                popup = await popup_info.value
                if popup:
                    # Wait for navigation in popup
                    try:
                        await popup.wait_for_load_state('domcontentloaded', timeout=10000)
                    except Exception:
                        pass
                    url = popup.url
                    return url
        except Exception:
            continue

    # If no popup was created, maybe the click triggers a same-tab navigation
    try:
        # Click first matching selector even if no popup detected
        for s in [x.strip() for x in sel.split(',')]:
            try:
                found = await page.query_selector(s)
                if found:
                    await found.click()
                    # wait a short time for navigation
                    await page.wait_for_load_state('domcontentloaded', timeout=5000)
                    return page.url
            except Exception:
                continue
    except Exception:
        pass

    return None


async def test_login_flow(base_url: str, provider: str, headless: bool, timeout: int):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        context = await browser.new_context()
        page = await context.new_page()
        target = base_url.rstrip('/') + '/secure/index.html'
        print(f"Opening {target}")
        try:
            await page.goto(target, timeout=timeout * 1000)
        except PlaywrightError as e:
            print(f"Failed to open page: {e}")
            await browser.close()
            return {'provider': provider, 'ok': False, 'reason': 'open_failed', 'error': str(e)}

        # Optional: accept cookies or close banners if they block the buttons (user can add selectors)

        try:
            result_url = await click_login_button(page, provider)
        except Exception as e:
            await browser.close()
            return {'provider': provider, 'ok': False, 'reason': 'click_failed', 'error': str(e)}

        # Heuristic: success if result_url is a known provider domain
        ok = False
        details = {'result_url': result_url}
        if result_url:
            if 'accounts.google.com' in result_url or 'login.microsoftonline.com' in result_url or 'login.live.com' in result_url:
                ok = True
                details['reason'] = 'provider_signin'
            else:
                details['reason'] = 'unexpected_url'
        else:
            details['reason'] = 'no_navigation_detected'

        await browser.close()
        return {'provider': provider, 'ok': ok, 'details': details}


async def main_async(args):
    results = []
    for provider in ('google', 'microsoft'):
        print('\n=== Testing', provider, '===')
        res = await test_login_flow(args.base_url, provider, args.headless, args.timeout)
        print('Result:', res)
        results.append(res)

    failures = [r for r in results if not r['ok']]
    if failures:
        print('\nOne or more checks failed')
        return 1
    else:
        print('\nAll checks passed (UI -> provider sign-in detected)')
        return 0


def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument('--base-url', default='https://www.caracore.com.br', help='Base URL of site to test')
    p.add_argument('--timeout', type=int, default=20, help='Navigation timeout in seconds')
    p.add_argument('--headless', action='store_true', help='Run browser in headless mode')
    args = p.parse_args(argv)

    code = asyncio.run(main_async(args))
    sys.exit(code)


if __name__ == '__main__':
    main()
