import { ServerResponse } from 'http';

export type RedirectCode = 300 | 301 | 302 | 303 | 304 | 307;

/**
 * Redirect to the target URL.
 * If `res` is provided, then a server-side redirect is performed using the given status code.
 * Otherwise, a client-side redirect is performed.
 */
export default (code: RedirectCode, target: string, res?: ServerResponse) => {
  if (res) {
    res.writeHead(code, { Location: target });
    res.end();
  } else {
    window.location.replace(target);
  }
};
