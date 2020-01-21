import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { NextContext } from 'next';
import { DefaultQuery } from 'next/router';
import App, { AppContext, AppInitialProps, AppProps } from 'next/app';

import { appWithApolloClient } from '@yolkai/next-utils';

interface MyAppParams {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

type MyAppProps = AppProps & MyAppParams;
type MyAppContext = AppContext & MyAppParams;

export type MyAppPageContext<Q extends DefaultQuery = DefaultQuery> = NextContext<Q> & MyAppParams;

export class MyApp extends App<MyAppProps> {
  static async getInitialProps({
    ctx,
    Component,
    apolloClient,
  }: MyAppContext): Promise<AppInitialProps> {
    let pageProps;
    if (Component.getInitialProps) {
      const c: MyAppPageContext = { ...ctx, apolloClient };
      pageProps = await Component.getInitialProps(c);
    } else {
      pageProps = {};
    }

    return { pageProps };
  }
}

export default appWithApolloClient(MyApp);
