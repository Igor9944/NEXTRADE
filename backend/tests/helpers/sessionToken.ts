const SESSION_COOKIE_NAME = 'nextrade_session';
const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export function extractSessionToken(setCookie: string | string[] | undefined): string {
  const headers = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  const tokens: string[] = [];

  for (const header of headers) {
    const cookiePair = header.split(';', 1)[0].trim();
    const separatorIndex = cookiePair.indexOf('=');
    const cookieName = (separatorIndex < 0 ? cookiePair : cookiePair.slice(0, separatorIndex)).trim();

    if (cookieName !== SESSION_COOKIE_NAME) {
      continue;
    }

    const token = separatorIndex < 0 ? '' : cookiePair.slice(separatorIndex + 1).trim();
    if (!JWT_PATTERN.test(token)) {
      throw new Error('nextrade_session cookie has an empty or malformed value');
    }

    tokens.push(token);
  }

  if (tokens.length === 0) {
    throw new Error('nextrade_session cookie is missing from Set-Cookie');
  }
  if (tokens.length > 1) {
    throw new Error('nextrade_session cookie is duplicated in Set-Cookie');
  }

  return tokens[0];
}
