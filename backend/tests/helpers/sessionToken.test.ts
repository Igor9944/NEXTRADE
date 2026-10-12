import { extractSessionToken } from './sessionToken';

describe('extractSessionToken', () => {
  it('extracts the session value from a Set-Cookie string', () => {
    expect(extractSessionToken('nextrade_session=header.payload.signature; Path=/; HttpOnly'))
      .toBe('header.payload.signature');
  });

  it('extracts the session value from a Set-Cookie array', () => {
    expect(extractSessionToken([
      'other_cookie=value; Path=/',
      'nextrade_session=header.payload.signature; Path=/; HttpOnly'
    ])).toBe('header.payload.signature');
  });

  it('throws a clear error when the session cookie is absent', () => {
    expect(() => extractSessionToken(['other_cookie=value; Path=/']))
      .toThrow('nextrade_session cookie is missing from Set-Cookie');
    expect(() => extractSessionToken(undefined))
      .toThrow('nextrade_session cookie is missing from Set-Cookie');
  });

  it('throws a clear error when the session cookie is malformed', () => {
    expect(() => extractSessionToken('nextrade_session=; Path=/'))
      .toThrow('nextrade_session cookie has an empty or malformed value');
    expect(() => extractSessionToken('nextrade_session'))
      .toThrow('nextrade_session cookie has an empty or malformed value');
  });

  it('throws a clear error when the session cookie is duplicated', () => {
    expect(() => extractSessionToken([
      'nextrade_session=first.payload.signature; Path=/',
      'nextrade_session=second.payload.signature; Path=/'
    ])).toThrow('nextrade_session cookie is duplicated in Set-Cookie');
  });
});
