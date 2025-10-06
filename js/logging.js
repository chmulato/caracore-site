// logging.js - safe structured logging with allowlist sanitization

(function () {
  const ALLOWED_FIELDS = new Set([
    'ts', 'event', 'request_id', 'session_id', 'user_pseudo_id', 'idp_iss',
    'flow', 'status', 'error_code', 'latency_ms', 'http_status'
  ]);

  function sanitizeLog(obj) {
    if (!obj || typeof obj !== 'object') return {};
    const out = {};
    for (const k of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        out[k] = obj[k];
      }
    }
    // normalize values
    if (!out.ts) out.ts = new Date().toISOString();
    if (!out.flow) out.flow = 'authorization_code_pkce';
    if (!out.status) out.status = 'ok';
    if (out.status !== 'ok' && out.status !== 'error') out.status = 'ok';
    return out;
  }

  async function sendLog(event) {
    const cfg = window.CARA_CORE_CONFIG || {};
    const endpoint = cfg.logsEndpoint; // only send if explicitly configured
    const payload = sanitizeLog(event);

    // In production we avoid sending logs to /logs by default to prevent 405s.
    if (!endpoint) {
      if (cfg.environment !== 'prod') {
        console.debug('[log] no logsEndpoint configured; skipping send', payload);
      }
      return false;
    }

    // Basic safety: only allow absolute https endpoints in prod
    try {
      const u = new URL(endpoint, window.location.origin);
      if (cfg.environment === 'prod' && u.protocol !== 'https:') {
        if (cfg.environment !== 'prod') console.warn('[log] insecure logsEndpoint blocked in prod');
        return false;
      }
    } catch (e) {
      if (cfg.environment !== 'prod') console.warn('[log] invalid logsEndpoint', endpoint);
      return false;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (cfg.environment !== 'prod') {
        console.log('[log->endpoint]', endpoint, payload, 'status:', res.status);
      }
      return res.ok;
    } catch (err) {
      // Do not spam production consoles; only debug in non-prod
      if (cfg.environment !== 'prod') {
        console.log('[log->endpoint:error]', err);
      }
      return false;
    }
  }

  window.Logging = { sanitizeLog, sendLog };
})();
