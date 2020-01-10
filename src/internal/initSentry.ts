import { NextPageContext } from 'next';
import * as path from 'path';

import { RewriteFrames } from '@sentry/integrations';
import * as SentryModule from '@sentry/node';

export type CaptureExceptionFn = ({
  ctx,
  errorInfo,
  exception,
}: {
  ctx?: NextPageContext;
  errorInfo?: React.ErrorInfo;
  exception: any;
}) => string;

type SentryType = typeof SentryModule;

const Sentry: SentryType = process.browser ? require('@sentry/browser') : require('@sentry/node');

/**
 * Initialize Sentry with the given DSN and build ID.
 * Return the Sentry instance, and a `captureException` function which adds extra Next.js
 * information to the captured exception.
 *
 * @param sentryDsn The Sentry instance DSN.
 * @param buildId A build ID to use as the Sentry release name.
 * @param appPath The path to the application folder containing ".next/". e.g. '/path/to/yolkjs/packages/chatbot-manage-web'
 */
export default function initSentry(sentryDsn: string, buildId: string, appPath: string) {
  Sentry.init({
    dsn: sentryDsn,
    release: buildId,
    integrations: !process.browser
      ? [
          /**
           * Rewrite frames of Sentry events so that Sentry can use source maps to resolve file
           * paths to the original file and line number.
           *
           * See also:
           *  - https://github.com/getsentry/sentry-javascript/issues/1785#issuecomment-445835738
           *  - https://docs.sentry.io/platforms/node/typescript/
           *  - https://github.com/getsentry/sentry-javascript/blob/22a2a4e42f59fa83052d71ad53c1786f5596d526/packages/integrations/src/rewriteframes.ts
           */
          new RewriteFrames({
            iteratee: frame => {
              if (frame.filename && frame.filename.includes('node_modules')) {
                // Skip frames for sources in node_modules; we only care about application code
                return frame;
              }
              if (frame.filename && frame.filename.startsWith('/')) {
                // For the given file system path, determine the path relative to the folder
                // containing ".next/". Then update the filename so that Sentry can find the
                // corresponding source map in its release artifacts.
                // For example:
                //     frame.filename === "/path/to/yolkjs/packages/chatbot-manage-web/.next/static/development/pages/hub/[hub_name].js"
                //   result:
                //     frame.filename === "app://_next/static/development/pages/hub/[hub_name].js"
                //   Sentry will load the source map:
                //     "~/_next/static/development/pages/hub/[hub_name].js.map"
                const relativePath = path.relative(appPath, frame.filename);
                frame.filename = relativePath.replace(/^\.next/, 'app:///_next');
              }
              return frame;
            },
          }),
        ]
      : [],
  });

  const captureException: CaptureExceptionFn = ({ ctx, errorInfo, exception }) => {
    Sentry.configureScope(scope => {
      scope.setTag('ssr', process.browser ? 'false' : 'true');

      if (exception.message) {
        // De-duplication currently doesn't work correctly for SSR / browser errors
        // so we force deduplication by error message if it is present
        scope.setFingerprint([exception.message]);
      }

      if (exception.statusCode) {
        scope.setExtra('statusCode', exception.statusCode);
      }

      if (ctx) {
        const { req, res, query, pathname } = ctx;

        scope.setExtra('pathname', pathname);
        scope.setExtra('query', query);

        if (res && res.statusCode) {
          scope.setExtra('statusCode', res.statusCode);
        }

        if (req) {
          scope.setExtra('url', req.url);
          scope.setExtra('method', req.method);
          scope.setExtra('headers', req.headers);
        }
      }
      if (errorInfo) {
        scope.setExtra('componentStack', errorInfo.componentStack);
      }
    });

    return Sentry.captureException(exception);
  };

  return { Sentry, captureException };
}
