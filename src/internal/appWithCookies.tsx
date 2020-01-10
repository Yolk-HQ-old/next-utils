import { NextComponentType } from 'next';
import { AppContext, AppProps, AppInitialProps } from 'next/app';
import * as React from 'react';
import { Cookies } from 'react-cookie';

export interface AppWithCookiesInitialProps<TWrappedAppInitialProps> extends AppInitialProps {
  cookieHeader: String;
  wrappedAppInitialProps: TWrappedAppInitialProps;
}

/**
 * Additional parameters passed by AppWithCookies to WrappedApp.
 */
interface AppWithCookiesParams {
  cookies: Cookies;
}

/**
 * React higher-order component (HoC) which wraps the App component and passes a cookies access
 * object to the App component.
 *
 * @template TWrappedAppParams
 *   The parameters which WrappedApp expects via props _and_ getInitialProps context. For example,
 *   WrappedApp may expect a `apolloClient` parameter as `ctx.apolloClient` and `props.apolloClient`.
 * @template TWrappedAppInitialProps
 *   The initial props returned by WrappedApp.getInitialProps(). By default, this is AppInitialProps,
 *   but may be extended by WrappedApp.
 */
const appWithCookies = <
  TWrappedAppParams extends object = {},
  TWrappedAppInitialProps extends AppInitialProps = AppInitialProps
>(
  WrappedApp: NextComponentType<
    AppContext & TWrappedAppParams & AppWithCookiesParams,
    TWrappedAppInitialProps,
    AppProps & TWrappedAppParams & TWrappedAppInitialProps & { cookies: Cookies }
  >,
) => {
  const wrappedComponentName = WrappedApp.displayName || WrappedApp.name || 'Component';
  class AppWithCookies extends React.Component<
    AppProps & TWrappedAppParams & AppWithCookiesInitialProps<TWrappedAppInitialProps>
  > {
    static displayName = `appWithCookies(${wrappedComponentName})`;

    static async getInitialProps(
      ctx: AppContext & TWrappedAppParams,
    ): Promise<AppWithCookiesInitialProps<TWrappedAppInitialProps>> {
      const { req } = ctx.ctx;
      let cookieHeader;
      let cookies;
      if (req && req.headers && req.headers.cookie) {
        cookieHeader = Array.isArray(req.headers.cookie)
          ? req.headers.cookie[0]
          : req.headers.cookie;
        cookies = new Cookies(cookieHeader);
      } else {
        cookieHeader = '';
        cookies = new Cookies();
      }

      let wrappedAppInitialProps;
      if (WrappedApp.getInitialProps) {
        const wrappedAppCtx: AppContext & TWrappedAppParams & AppWithCookiesParams = {
          ...ctx,
          cookies,
        };
        wrappedAppInitialProps = await WrappedApp.getInitialProps(wrappedAppCtx);
      } else {
        // If `WrappedApp.getInitialProps` is not defined, force WrappedApp to accept empty
        // pageProps as its initial props:
        wrappedAppInitialProps = { pageProps: {} } as TWrappedAppInitialProps;
      }
      return {
        // Must always pass `pageProps` to satisfy the type constraint:
        //   TWrappedAppInitialProps extends AppInitialProps
        pageProps: wrappedAppInitialProps.pageProps,
        cookieHeader,
        wrappedAppInitialProps: wrappedAppInitialProps,
      };
    }
    render() {
      const { cookieHeader, wrappedAppInitialProps, ...props } = this.props;

      // TODO: remove the following type assertion once proper spread types are implemented:
      // https://github.com/Microsoft/TypeScript/issues/10727
      const waProps: AppProps & TWrappedAppParams = props as AppProps & TWrappedAppParams;

      const waiProps: TWrappedAppInitialProps = wrappedAppInitialProps;
      return <WrappedApp {...waProps} {...waiProps} cookies={new Cookies(cookieHeader)} />;
    }
  }

  const AWC: NextComponentType<
    AppContext & TWrappedAppParams,
    AppWithCookiesInitialProps<TWrappedAppInitialProps>,
    AppProps & TWrappedAppParams & AppWithCookiesInitialProps<TWrappedAppInitialProps>
  > = AppWithCookies;

  return AWC;
};

export default appWithCookies;
