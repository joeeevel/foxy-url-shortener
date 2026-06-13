import { isIP } from 'net';

const FORBIDDEN_PROTOCOLS = ['javascript:', 'data:', 'file:', 'blob:', 'vbscript:'];
const PRIVATE_RANGES = ['10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '192.168.', '127.', '0.'];

function isPrivateHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '::1') {
    return true;
  }

  if (isIP(hostname)) {
    return PRIVATE_RANGES.some((prefix) => hostname.startsWith(prefix));
  }

  return false;
}

export function validateTargetUrl(urlString: string): { valid: boolean; error?: string } {
  let parsed: URL;

  try {
    parsed = new URL(urlString);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  if (FORBIDDEN_PROTOCOLS.includes(parsed.protocol)) {
    return { valid: false, error: 'URL protocol not allowed' };
  }

  if (isPrivateHost(parsed.hostname)) {
    return { valid: false, error: 'URL points to a private network' };
  }

  return { valid: true };
}
