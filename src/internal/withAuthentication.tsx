import hoistNonReactStatics from 'hoist-non-react-statics';
import { NextComponentType, NextPageContext } from 'next';
import * as React from 'react';
import { Cookies } from 'react-cookie';
import * as url from 'url';
import getConfig from 'next/config';
import generate from 'nanoid/generate';

const generateState = () => generate('abcdefghijklmnopqrstuvwxyz', 10);

import { CheckAuthenticated } from './makeAuthCallbackPage';
import redirect from './redirect';

export interface MyAppParams {
  cookies: Cookies;
}

interface WithAuthenticationInitialProps {
  accessToken: string;
}

interface WrappedPageProps {
  accessToken: string;
}

type MyAppPageContext = NextPageContext & MyAppParams;

interface AuthenticationConfig<TWrappedPageComponentContext extends MyAppPageContext> {
  authUrl: string;
  host: string;
  protocol: string;
  checkAuthenticated: CheckAuthenticated<TWrappedPageComponentContext>;
}

/**
 * A higher-order component which ensures that the viewer is authenticated, using the access token
 * stored in a cookie "token". If the access token is invalid, expired, or missing, the viewer is
 * redirected to the login application using the `authUrl` Next.js config.
 *
 * This HoC may only be applied to Next.js page components, since getInitialProps() has no effect on
 * non-page components.
 *
 * @template TWrappedPageComponentProps
 *   The props which WrappedPageComponent expects.
 * @template TWrappedPageComponentInitialProps
 *   The initial props which WrappedPageComponent.getInitialProps() returns.
 * @template TWrappedPageComponentContext
 *   The context which WrappedPageComponent expects passed to WrappedPageComponent.getInitialProps(ctx).
 */
const withAuthentication = <TWrappedPageComponentContext extends MyAppPageContext>(
  authenticationConfig: AuthenticationConfig<TWrappedPageComponentContext>,
) => <TWrappedPageComponentProps extends object, TWrappedPageComponentInitialProps extends object>(
  WrappedPageComponent: NextComponentType<
    TWrappedPageComponentContext,
    TWrappedPageComponentInitialProps,
    TWrappedPageComponentProps & WrappedPageProps
  >,
) => {
  const wrappedComponentName =
    WrappedPageComponent.displayName || WrappedPageComponent.name || 'Component';
  class WithAuthentication extends React.Component<
    TWrappedPageComponentProps & WithAuthenticationInitialProps
  > {
    static displayName = `withAuthentication(${wrappedComponentName})`;

    static async getInitialProps(ctx: TWrappedPageComponentContext) {
      const { cookies } = ctx;
      const accessToken: string | undefined = cookies.get('token');

      let pageProps;
      if (WrappedPageComponent.getInitialProps) {
        pageProps = await WrappedPageComponent.getInitialProps(ctx);
      }

      if (!accessToken || !(await authenticationConfig.checkAuthenticated(ctx, accessToken))) {
        // Access token is not valid; redirect to login:
        const { authUrl, host, protocol } = authenticationConfig;
        const { tokenCookieDomain } = getConfig().publicRuntimeConfig;
        const state = generateState();
        if (ctx?.res?.setHeader) {
          ctx.res.setHeader('Set-Cookie', `state=${state}; Path=/; Domain=${tokenCookieDomain}`);
        } else {
          cookies.set('state', state, {
            domain: tokenCookieDomain,
            path: '/',
          });
        }
        const redirectUrl = url.format({
          pathname: authUrl,
          query: {
            redirect_uri: url.format({
              protocol,
              host,
              pathname: '/auth_callback',
              query: { path: ctx.asPath },
            }),
            state,
          },
        });
        const { res } = ctx;
        redirect(303, redirectUrl, res);
        return Object.assign({}, pageProps, { accessToken: 'invalid' });
      }
      return Object.assign({}, pageProps, { accessToken });
    }

    render() {
      const { accessToken, ...props } = this.props;

      // TODO: remove the following type assertion once proper spread types are implemented:
      // https://github.com/Microsoft/TypeScript/issues/10727
      const wrappedPageProps: TWrappedPageComponentProps = props as TWrappedPageComponentProps;

      return <WrappedPageComponent {...wrappedPageProps} accessToken={accessToken} />;
    }
  }
  hoistNonReactStatics(
    WithAuthentication,
    WrappedPageComponent,
    // Prevent hoisting `getInitialProps`:
    { getInitialProps: true },
  );

  const WA: NextComponentType<
    TWrappedPageComponentContext,
    TWrappedPageComponentInitialProps & WrappedPageProps,
    TWrappedPageComponentProps & WithAuthenticationInitialProps
  > = WithAuthentication;

  return WA;
};

export default withAuthentication;
