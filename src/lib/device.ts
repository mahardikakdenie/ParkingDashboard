export interface DevicePayload {
  firebase_id: string;
  device_browser: string;
  device_browser_version: string;
  device_fingerprint: string;
  device_imei: string;
  device_model: string;
  device_type: string;
  device_vendor: string;
  device_os: string;
  device_os_version: string;
  device_platform: 'web' | 'mobile';
  user_agent: string;
  app_version: string;
}

export function getDevicePayload(): DevicePayload {
  if (typeof window === 'undefined') {
    return {
      firebase_id: 'web-firebase-dummy-token',
      device_browser: 'Chrome',
      device_browser_version: '120.0.0.0',
      device_fingerprint: 'web-fp-server-side',
      device_imei: 'N/A',
      device_model: 'Desktop',
      device_type: 'web',
      device_vendor: 'Google',
      device_os: 'Windows',
      device_os_version: '10.0',
      device_platform: 'web',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      app_version: '1.0.0',
    };
  }

  const ua = navigator.userAgent;
  let browser = 'Chrome';
  let browserVersion = '120.0.0.0';
  let os = 'Windows';
  let osVersion = '10.0';

  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    browserVersion = ua.split('Firefox/')[1]?.split(' ')[0] || '120.0.0.0';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    browserVersion = ua.split('Edg/')[1]?.split(' ')[0] || '120.0.0.0';
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
    browserVersion = ua.split('Chrome/')[1]?.split(' ')[0] || '120.0.0.0';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    browser = 'Safari';
    browserVersion = ua.split('Version/')[1]?.split(' ')[0] || '17.0.0.0';
  }

  if (ua.includes('Windows NT 10.0')) {
    os = 'Windows';
    osVersion = '10.0';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
    osVersion = ua.split('Mac OS X ')[1]?.split(')')[0]?.replace(/_/g, '.') || '14.0';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
    osVersion = '1.0';
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const platform: 'web' | 'mobile' = isMobile ? 'mobile' : 'web';
  const fingerprint = `web-fp-${btoa(ua.slice(0, 20) + navigator.language).slice(0, 16)}`;

  return {
    firebase_id: 'web-firebase-token',
    device_browser: browser,
    device_browser_version: browserVersion,
    device_fingerprint: fingerprint,
    device_imei: 'N/A',
    device_model: isMobile ? 'Mobile Device' : 'Desktop',
    device_type: isMobile ? 'mobile' : 'web',
    device_vendor: navigator.vendor || 'Google Inc.',
    device_os: os,
    device_os_version: osVersion,
    device_platform: platform,
    user_agent: ua,
    app_version: '1.0.0',
  };
}
