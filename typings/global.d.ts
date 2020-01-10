/**
 * `process.browser` is defined by webpack.
 * See https://github.com/zeit/next.js/issues/2177#issuecomment-357438567
 */
declare namespace NodeJS {
  interface Process {
    browser: boolean;
  }
}
