/**
 * This is a customized Next.js App component, which is used as the root component
 * for all pages in the application.
 *
 * See also: https://github.com/zeit/next.js/tree/1babde1026a89b538d2caebd5d74ef6351871566#custom-app
 */

import { NextPageContext } from 'next';
import App, { AppContext, AppInitialProps, AppProps } from 'next/app';
import getConfig from 'next/config';
import React from 'react';

import { appWithSentry, initSentry } from '@yolkai/next-utils';

const { sentryDsn } = process.browser
  ? getConfig().publicRuntimeConfig
  : getConfig().serverRuntimeConfig;
const { captureException } = initSentry(sentryDsn, __next_build_id__, __next_app_path__);

export interface MyAppParams {}

type MyAppContext = AppContext & MyAppParams;
type MyAppInitialProps = AppInitialProps;
type MyAppProps = AppProps & MyAppParams & MyAppInitialProps;

export type MyAppPageContext = NextPageContext & MyAppParams;

class MyApp extends React.Component<MyAppProps> {
  static async getInitialProps({ ctx, Component }: MyAppContext): Promise<MyAppInitialProps> {
    let pageProps;
    if (Component.getInitialProps) {
      const c: MyAppPageContext = { ...ctx };
      pageProps = await Component.getInitialProps(c);
    } else {
      pageProps = {};
    }
    return { pageProps };
  }

  /**
   * Capture errors with Sentry, then re-throw them for Next.js to handle.
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureException({
      errorInfo,
      exception: error,
    });
    throw error;
  }

  render() {
    const { Component, pageProps, router } = this.props;
    return (
      <>
        <App Component={Component} router={router} pageProps={pageProps} />
      </>
    );
  }
}

export default appWithSentry(captureException)(MyApp);
