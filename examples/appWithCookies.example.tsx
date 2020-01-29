/**
 * This is a customized Next.js App component, which is used as the root component
 * for all pages in the application.
 *
 * See also: https://github.com/zeit/next.js/tree/1babde1026a89b538d2caebd5d74ef6351871566#custom-app
 */

import { NextPageContext } from 'next';
import App, { AppContext, AppInitialProps, AppProps } from 'next/app';
import React from 'react';
import { Cookies } from 'react-cookie';

import { appWithCookies } from '@yolkai/next-utils';

export interface MyAppParams {
  cookies: Cookies;
}

type MyAppContext = AppContext & MyAppParams;
type MyAppInitialProps = AppInitialProps;
type MyAppProps = AppProps & MyAppParams & MyAppInitialProps;

export type MyAppPageContext = NextPageContext & MyAppParams;

class MyApp extends React.Component<MyAppProps> {
  static async getInitialProps({
    ctx,
    Component,
    cookies,
  }: MyAppContext): Promise<MyAppInitialProps> {
    let pageProps;
    if (Component.getInitialProps) {
      const c: MyAppPageContext = { ...ctx, cookies };
      pageProps = await Component.getInitialProps(c);
    } else {
      pageProps = {};
    }
    return { pageProps };
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

export default appWithCookies(MyApp);
