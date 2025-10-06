"""
Playwright-based diagnostic for OIDC login attempts (Google and Microsoft)

What it does:
- Opens https://www.caracore.com.br/secure/index.html
- For each provider (google, microsoft):
  - Captures page console messages
  - Captures network requests (URLs)
  - Clicks the login button (selectors may need tuning)
  - Waits for popup or navigation
  - Takes screenshots (before click, after click, popup if any)
  - Saves JSON report and screenshots into .tmp_oidc_diagnostics/<provider>/

Usage:
  python scripts/test_oidc_login_full.py --headless

Requirements:
  pip install playwright
  python -m playwright install

Note: The script does not perform credentials submission. It records the provider response and artifacts to diagnose redirect/consent issues.
"""
from __future__ import annotations
import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except Exception:
    print('Playwright not installed. Run: python -m pip install playwright && python -m playwright install')
    raise


BASE_OUT = Path('.tmp_oidc_diagnostics')
BASE_OUT.mkdir(exist_ok=True)

DEFAULT_SELECTORS = {
    'google': "#btnLoginGoogle, button[data-provider='google'], .btn-google, .login-google, #login-google",
    'microsoft': "#btnLoginMicrosoft, button[data-provider='microsoft'], .btn-microsoft, .login-ms, #login-microsoft",
}


async def capture_for_provider(context, page, provider: str, args, selectors):
    out = BASE_OUT / provider
    out.mkdir(parents=True, exist_ok=True)
    report = {'provider': provider, 'steps': [], 'console': [], 'requests': []}

    # Console listener
    page.on('console', lambda msg: report['console'].append({'type': msg.type, 'text': msg.text}))

    # Request listener
    async def on_request(req):
        report['requests'].append({'url': req.url, 'method': req.method, 'resource_type': req.resource_type})
    page.on('request', on_request)

    target = args.base_url.rstrip('/') + '/secure/index.html'
    await page.goto(target, timeout=args.timeout * 1000)
    await page.screenshot(path=str(out / 'before_click.png'))

    # find selectors - try a broader set (wait for dynamic injection)
    sel_string = selectors.get(provider)
    found = None
    found_el = None
    tried = []

    # helper to attempt a CSS selector
    async def try_css(s):
        try:
            el = await page.query_selector(s)
            return el
        except Exception:
            return None

    # helper to attempt XPath
    async def try_xpath(x):
        try:
            els = await page.query_selector_all(f'xpath={x}')
            return els[0] if els else None
        except Exception:
            return None

    # allow the page some time to render dynamic buttons
    await page.wait_for_timeout(1500)

    # candidate selectors: provider-specific first, then provided ones, then broader heuristics
    candidates = []

    # provider-specific textual selectors (Playwright text/has-text patterns and common Portuguese labels)
    if provider == 'google':
        candidates += [
            "#btnLoginGoogle",
            "button:has-text('Google')",
            "button:has-text('Continuar com Google')",
            "a:has-text('Google')",
            "button[class*='google']",
            "a[class*='google']",
        ]
    elif provider == 'microsoft':
        candidates += [
            "#btnLoginMicrosoft",
            "button:has-text('Microsoft')",
            "button:has-text('Entrar com Microsoft')",
            "button:has-text('Continuar com Microsoft')",
            "a:has-text('Microsoft')",
            "button[class*='ms']",
            "a[class*='microsoft']",
        ]

    # then include any explicit selectors provided in DEFAULT_SELECTORS
    if sel_string:
        candidates += [x.strip() for x in sel_string.split(',') if x.strip()]

    # common fallbacks
    candidates += [
        "a[href*='accounts.google.com']",
        "a[href*='login.microsoftonline.com']",
        "button[aria-label*='Google']",
        "button[aria-label*='Microsoft']",
    ]

    # Try CSS candidates
    for s in candidates:
        tried.append({'type': 'css', 'selector': s})
        el = await try_css(s)
        if el:
            found = s
            found_el = el
            break

    # Try text-based locator (case-insensitive)
    if not found:
        try:
            # Playwright text selector using regex
            el = await page.query_selector("text=/google/i")
            if el:
                found = "text=/google/i"
                found_el = el
        except Exception:
            pass

    # Try XPath matches
    if not found:
        # XPath: button or a containing provider name
        xpath_candidates = [
            "//button[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'google')]",
            "//a[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'google')]",
            "//button[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'microsoft')]",
            "//a[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'microsoft')]",
        ]
        for x in xpath_candidates:
            tried.append({'type': 'xpath', 'selector': x})
            el = await try_xpath(x)
            if el:
                found = f'xpath:{x}'
                found_el = el
                break

    if not found:
        report['steps'].append({'action': 'find_button', 'ok': False, 'reason': 'selector_not_found', 'tested': tried})
        (out / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
        return report

    # capture outerHTML of matched element for diagnostics
    try:
        outer = await found_el.evaluate('e => e.outerHTML')
    except Exception:
        outer = None

    report['steps'].append({'action': 'find_button', 'ok': True, 'selector': found, 'outerHTML': outer})

    # Click and capture popup or navigation
    try:
        async with page.expect_popup() as popup_info:
            await page.click(found)
        popup = await popup_info.value
        # popup opened
        report['steps'].append({'action': 'click', 'ok': True, 'result': 'popup'})
        try:
            await popup.wait_for_load_state('domcontentloaded', timeout=10000)
        except Exception:
            pass
        report['popup_url'] = popup.url
        await popup.screenshot(path=str(out / 'popup.png'))
    except Exception:
        # no popup; check navigation in same page
        try:
            await page.wait_for_load_state('domcontentloaded', timeout=5000)
        except Exception:
            pass
        report['steps'].append({'action': 'click', 'ok': True, 'result': 'no_popup'})
        report['page_url_after_click'] = page.url
        await page.screenshot(path=str(out / 'after_click.png'))

    # Save collected info
    (out / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    return report


async def main_async(args):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=args.headless)
        context = await browser.new_context()
        page = await context.new_page()

        selectors = DEFAULT_SELECTORS
        results = {}
        for provider in ('google', 'microsoft'):
            print('Testing', provider)
            report = await capture_for_provider(context, page, provider, args, selectors)
            results[provider] = report

        await browser.close()
    # Write overall report
    Path(BASE_OUT / 'summary.json').write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding='utf-8')
    print('Diagnostics saved to', str(BASE_OUT))


def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument('--base-url', default='https://www.caracore.com.br', help='Base URL to test')
    p.add_argument('--timeout', type=int, default=20, help='Navigation timeout')
    p.add_argument('--headless', action='store_true', help='Run headless')
    args = p.parse_args(argv)

    code = asyncio.run(main_async(args))


if __name__ == '__main__':
    main()
