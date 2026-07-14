/**
 * analytics.js — Privacy-first usage logging to a Google Sheet
 *
 * Events are POSTed fire-and-forget to a Google Apps Script web app that
 * appends one row per event (see analytics/apps-script.gs and
 * analytics/SETUP.md). Only event metadata is ever sent — never the contents
 * of any form field. No cookies, no storage, no fingerprinting.
 *
 * Leave ANALYTICS_ENDPOINT empty to disable tracking entirely.
 */

const ANALYTICS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz9onO-1PxbpxcUC5kEoYIsCm8aM7fcEgDhky4g63kNaEZkqceGFEv3TqH73GcE42Y/exec';

// Random id per page load, held in memory only. Distinguishes repeated
// copies within one sitting from separate uses; identifies no one.
const SESSION_ID = crypto.randomUUID();

/**
 * Record a usage event. Never throws and never blocks the caller —
 * analytics must not interfere with issuing an alert.
 * @param {string} event
 * @param {Record<string, string|number|boolean>} [data]
 */
export function trackEvent(event, data = {}) {
  if (!ANALYTICS_ENDPOINT) return;
  try {
    const body = new URLSearchParams({ event, session: SESSION_ID });
    for (const [key, value] of Object.entries(data)) {
      body.set(key, String(value));
    }
    if (navigator.sendBeacon && navigator.sendBeacon(ANALYTICS_ENDPOINT, body)) return;
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      body,
    }).catch(() => {});
  } catch (_err) {
    // Swallow everything: no analytics failure may surface to the user.
  }
}
