import { NextPageContext } from 'next';
import getConfig from 'next/config';
import { I18n } from '@lingui/react';
import { I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { Cookies } from 'react-cookie';

import redirect from './redirect';

export interface CheckAuthenticated<Context extends NextPageContext & { cookies: Cookies }> {
  (ctx: Context, accessToken: string): Promise<boolean>;
}

export interface ResponseMessages {
  stateInvalid: string;
  destinationPathInvalid: string;
  noAccessToken: string;
  authenticatedFailed: string;
  authenticated: string;
}

interface AuthCallbackPageProps {
  accessToken?: string;
  isAuthenticated: boolean;
  isDestinationPathValid: boolean;
  isStateValid: boolean;
}

/**
 * This is a factory function that creates authentication callback pages
 * to be used by a consuming application.
 *
 * The factory is necessary because the required `checkAuthentication` param
 * has multiple implementations, each of which may require a different `Context`.
 * Therefore the `Context` param in `getInitialProps` needs to be generic
 * since it's type is dependent on the consuming application.
 *
 * This factory function allows the consuming application to supply
 * a `Context`, and then it returns an `AuthCallbackPage` whose `getInitialProps`
 * method is properly typed to work with the supplied `checkAuthenticated` method.
 *
 * @param checkAuthenticated A method that checks if the user is authenticated
 * @param responseMessages A set of responses to use in the rendered output
 */
const makeAuthCallbackPage = <Context extends NextPageContext & { cookies: Cookies }>(
  checkAuthenticated: CheckAuthenticated<Context>,
  responseMessages: (i18n: I18nType) => ResponseMessages = () => ({
    stateInvalid: 'Authentication failed. The provided state is not valid.',
    destinationPathInvalid: 'Authentication failed. The provided path is not valid.',
    noAccessToken: 'Authentication failed. The access token is missing.',
    authenticatedFailed: 'Authentication failed. The access token may be invalid or expired.',
    authenticated: 'Authenticated; redirecting...',
  }),
) => {
  return class AuthCallbackPage extends React.Component<AuthCallbackPageProps> {
    static async getInitialProps(ctx: Context) {
      /**
       * We defensively assume this request is not valid.
       *
       * Before logging the user in we'll first:
       *    - verify that the state param is the one we originally sent to login.yolk.dev
       *    - verify that the path is valid by ensuring it doesn't point to an external URL
       *    - verify that the access token we were provided is valid
       */
      let isStateValid = false;
      let isDestinationPathValid = false;
      let isAuthenticated = false;

      const { cookies, query, res } = ctx;
      const { access_token, path: destinationPath } = query;
      const accessToken = Array.isArray(access_token) ? access_token[0] : access_token;

      const originalState = cookies.get('state');
      const requestState = ctx.query.state;

      if (originalState && originalState === requestState) {
        isStateValid = true;
      }

      const target = (Array.isArray(destinationPath) ? destinationPath[0] : destinationPath) || '/';
      const decodedTarget = decodeURIComponent(target);

      if (decodedTarget.startsWith('/') && !decodedTarget.startsWith('//')) {
        isDestinationPathValid = true;
      }

      /**
       * If the state is valid, the destination is valid, and the access token is valid,
       * we'll redirect the user to the destination path specified in the URL.
       */
      if (
        isStateValid &&
        isDestinationPathValid &&
        accessToken &&
        (await checkAuthenticated(ctx, accessToken))
      ) {
        const { tokenCookieDomain } = getConfig().publicRuntimeConfig;
        if (res && res.setHeader) {
          res.setHeader('Set-Cookie', `token=${accessToken}; Path=/; Domain=${tokenCookieDomain}`);
        } else {
          cookies.set('token', accessToken, {
            domain: tokenCookieDomain,
            path: '/',
          });
        }
        redirect(303, target, res);
      }

      return { accessToken, isAuthenticated, isDestinationPathValid, isStateValid };
    }

    render() {
      const { accessToken, isAuthenticated, isDestinationPathValid, isStateValid } = this.props;
      return (
        <I18n>
          {({ i18n }) => {
            const messages = responseMessages(i18n);
            if (!isStateValid) {
              return <p>{messages.stateInvalid}</p>;
            }

            if (!isDestinationPathValid) {
              return <p>{messages.destinationPathInvalid}</p>;
            }

            if (!accessToken) {
              return <p>{messages.noAccessToken}</p>;
            }

            if (!isAuthenticated) {
              return <p>{messages.authenticatedFailed}</p>;
            }

            return <p>{messages.authenticated}</p>;
          }}
        </I18n>
      );
    }
  };
};

export default makeAuthCallbackPage;
