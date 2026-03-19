export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    // Convert base64url to base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if necessary
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const base64Str = base64 + padding;

    const jsonPayload = decodeURIComponent(
      window
        .atob(base64Str)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const isTokenExpiredSoon = (token: string, bufferMinutes: number = 2): boolean => {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expirationTimeMs = decoded.exp * 1000;
  const currentTimeMs = Date.now();
  const bufferTimeMs = bufferMinutes * 60 * 1000;

  const remainingTimeMs = expirationTimeMs - currentTimeMs;

  return remainingTimeMs < bufferTimeMs;
};
