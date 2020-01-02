/**
 * React higher-order component (HoC) which wraps the App component, captures any exceptions thrown
 * in `getInitialProps`, and emits them to Sentry.
 *
 * See also:
 *  - https://reactjs.org/docs/higher-order-components.html
 *  - https://github.com/zeit/next.js/blob/1babde1026a89b538d2caebd5d74ef6351871566/examples/with-apollo/lib/with-apollo-client.js
 */

import { NextComponentType } from 'next';
import { AppContext, AppProps, AppInitialProps } from 'next/app';
import * as React from 'react';

import { CaptureExceptionFn } from './initSentry';

export interface AppWithSentryInitialProps<TWrappedAppInitialProps> extends AppInitialProps {
  wrappedAppInitialProps: TWrappedAppInitialProps;
}

/**
 * @param captureException
 *   A function which emits the passed exception to Sentry when called.
 * @template TWrappedAppParams
 *   The parameters which WrappedApp expects via props _and_ getInitialProps context. For example,
 *   WrappedApp may expect a `cookies` parameter as `ctx.cookies` and `props.cookies`.
 * @template TWrappedAppInitialProps
 *   The initial props returned by WrappedApp.getInitialProps(). By default, this is AppInitialProps,
 *   but may be extended by WrappedApp.
 */
const appWithSentry = (captureException: CaptureExceptionFn) => <
  TWrappedAppParams extends object = {},
  TWrappedAppInitialProps extends AppInitialProps = AppInitialProps
>(
  WrappedApp: NextComponentType<
    AppContext & TWrappedAppParams,
    TWrappedAppInitialProps,
    AppProps & TWrappedAppParams & TWrappedAppInitialProps
  >,
) => {
  const wrappedComponentName = WrappedApp.displayName || WrappedApp.name || 'Component';
  class AppWithSentry extends React.Component<
    AppProps & TWrappedAppParams & AppWithSentryInitialProps<TWrappedAppInitialProps>
  > {
    static displayName = `appWithSentry(${wrappedComponentName})`;
    static async getInitialProps(
      ctx: AppContext & TWrappedAppParams,
    ): Promise<AppWithSentryInitialProps<TWrappedAppInitialProps>> {
      let wrappedAppInitialProps;
      try {
        if (WrappedApp.getInitialProps) {
          wrappedAppInitialProps = await WrappedApp.getInitialProps(ctx);
        } else {
          // If `WrappedApp.getInitialProps` is not defined, force WrappedApp to accept empty
          // pageProps as its initial props:
          wrappedAppInitialProps = { pageProps: {} } as TWrappedAppInitialProps;
        }
      } catch (error) {
        captureException({ ctx: ctx.ctx, exception: error });

        // Re-throw the error so it's handled by Next.js
        throw error;
      }

      return {
        // Must always pass `pageProps` to satisfy the type constraint:
        //   TWrappedAppInitialProps extends AppInitialProps
        pageProps: wrappedAppInitialProps.pageProps,
        wrappedAppInitialProps: wrappedAppInitialProps,
      };
    }

    render() {
      const { wrappedAppInitialProps, ...props } = this.props;

      // TODO: remove the following type assertion once proper spread types are implemented:
      // https://github.com/Microsoft/TypeScript/issues/10727
      const waProps: AppProps & TWrappedAppParams = props as AppProps & TWrappedAppParams;

      const waiProps: TWrappedAppInitialProps = wrappedAppInitialProps;
      return <WrappedApp {...waProps} {...waiProps} />;
    }
  }

  const AWS: NextComponentType<
    AppContext & TWrappedAppParams,
    AppWithSentryInitialProps<TWrappedAppInitialProps>,
    AppProps & TWrappedAppParams & AppWithSentryInitialProps<TWrappedAppInitialProps>
  > = AppWithSentry;

  return AWS;
};

export default appWithSentry;
