'use client';

// A simple canvas fingerprinting function
const getCanvasFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas-support';
    
    const txt = 'FirebaseStudio-Device-ID-!@#$%^&*()';
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(txt, 4, 17);
    
    const b64 = canvas.toDataURL().replace("data:image/png;base64,", "");
    // A simple hash function
    let hash = 0;
    for (let i = 0; i < b64.length; i++) {
        const char = b64.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  } catch (e) {
    return 'canvas-error';
  }
};


export const generateDeviceFingerprint = async (): Promise<string> => {
    // Fallback for non-browser environments
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || typeof screen === 'undefined') {
        return 'server-side-render';
    }
    
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width.toString(),
        screen.height.toString(),
        (new Date()).getTimezoneOffset().toString(),
        navigator.hardwareConcurrency?.toString() || 'unknown',
        navigator.platform,
        getCanvasFingerprint(),
    ];

    const joined = components.join('|||');
    
    // Use subtle crypto for a more robust hash (SHA-256)
    const encoder = new TextEncoder();
    const data = encoder.encode(joined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}
