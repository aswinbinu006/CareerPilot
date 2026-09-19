import { useEffect } from 'react';

const UTM_KEY = 'careerpilot_utm_telemetry';

export function useUTM() {
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      const captured = {};
      let hasUtm = false;

      utmKeys.forEach((key) => {
        const val = searchParams.get(key);
        if (val) {
          captured[key] = val;
          hasUtm = true;
        }
      });

      if (hasUtm) {
        sessionStorage.setItem(UTM_KEY, JSON.stringify(captured));
      }
    } catch {}
  }, []);
}

export function getStoredUTM() {
  try {
    const data = sessionStorage.getItem(UTM_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}
