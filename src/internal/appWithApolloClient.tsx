/**
 * React higher-order component (HoC) which wraps the App component and:
 *  - Performs the page's initial GraphQL request on the server, and serializes the result to be used
 *    as the initial Apollo state once the client mounts.
 *  - Passes the Apollo client to the wrapped App component.
 *
 * See also:
 *  - https://reactjs.org/docs/higher-order-components.html
 *  - https://github.com/zeit/next.js/blob/1babde1026a89b538d2caebd5d74ef6351871566/examples/with-apollo/lib/with-apollo-client.js
 */

import { getDataFromTree } from '@apollo/react-ssr';
import ApolloClient, { isApolloError } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { NextComponentType } from 'next';
import { AppContext, AppProps, AppInitialProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';

/*
 * Define some custom types for ApolloError. These should be removed once library types are
 * available: https://github.com/apollographql/apollo-client/issues/4203
 */
interface ApolloNetworkError extends Error {
  result?: {
    errors: ApolloNetworkErrorReason[];
  };
}
interface ApolloNetworkErrorReason {
  extensions: { [key: string]: any };
  locations: object[];
  message: string;
}

const isBrowser = typeof window !== 'undefined';

export interface AppWithApolloClientInitialProps<TWrappedAppInitialProps> extends AppInitialProps {
  apolloState: NormalizedCacheObject;
  wrappedAppInitialProps: TWrappedAppInitialProps;
}

/**
 * Additional parameters passed by AppWithApolloClient to WrappedApp.
 */
interface AppWithApolloClientParams {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

/**
 * @template TWrappedAppParams
 *   The parameters which WrappedApp expects via props _and_ getInitialProps context. For example,
 *   WrappedApp may expect a `cookies` parameter as `ctx.cookies` and `props.cookies`.
 * @template TWrappedAppInitialProps
 *   The initial props returned by WrappedApp.getInitialProps(). By default, this is DefaultAppIProps,
 *   but may be extended by WrappedApp.
 */
const appWithApolloClient = <TWrappedAppParams extends object = {}>(
  createApolloClient: (
    params: TWrappedAppParams,
    initialState?: NormalizedCacheObject,
  ) => ApolloClient<NormalizedCacheObject>,
) => <TWrappedAppInitialProps extends AppInitialProps = AppInitialProps>(
  WrappedApp: NextComponentType<
    AppContext & TWrappedAppParams & AppWithApolloClientParams,
    TWrappedAppInitialProps,
    AppProps & TWrappedAppParams & TWrappedAppInitialProps & AppWithApolloClientParams
  >,
): NextComponentType<
  AppContext & TWrappedAppParams,
  AppWithApolloClientInitialProps<TWrappedAppInitialProps>,
  AppProps & TWrappedAppParams & AppWithApolloClientInitialProps<TWrappedAppInitialProps>
> => {
  const wrappedComponentName = WrappedApp.displayName || WrappedApp.name || 'Component';
  class AppWithApolloClient extends React.Component<
    AppProps & TWrappedAppParams & AppWithApolloClientInitialProps<TWrappedAppInitialProps>
  > {
    static displayName = `appWithApolloClient(${wrappedComponentName})`;
    static async getInitialProps(
      ctx: AppContext & TWrappedAppParams,
    ): Promise<AppWithApolloClientInitialProps<TWrappedAppInitialProps>> {
      const { Component, router } = ctx;
      const apolloClient = createApolloClient(ctx);

      let wrappedAppInitialProps;
      if (WrappedApp.getInitialProps) {
        const wrappedAppCtx: AppContext & TWrappedAppParams & AppWithApolloClientParams = {
          ...ctx,
          apolloClient,
        };
        wrappedAppInitialProps = await WrappedApp.getInitialProps(wrappedAppCtx);
      } else {
        // If `WrappedApp.getInitialProps` is not defined, force WrappedApp to accept empty
        // pageProps as its initial props:
        wrappedAppInitialProps = { pageProps: {} } as TWrappedAppInitialProps;
      }

      if (!isBrowser) {
        // Run all GraphQL queries in the component tree
        // and extract the resulting data
        try {
          // Run all GraphQL queries
          const waParams: TWrappedAppParams = ctx;
          await getDataFromTree(
            <WrappedApp
              {...wrappedAppInitialProps}
              {...waParams}
              Component={Component}
              router={router}
              apolloClient={apolloClient}
            />,
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-options
          if (isApolloError(error)) {
            if (error.networkError) {
              const networkError: ApolloNetworkError = error.networkError;
              if (!networkError.result) {
                console.error('Error while running `getDataFromTree`', networkError);
              } else {
                const networkErrorReason = networkError.result.errors[0];
                console.error('Error while running `getDataFromTree`', networkErrorReason.message);
              }
            } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
              console.error(
                'Error while running `getDataFromTree`',
                JSON.stringify(error.graphQLErrors, undefined, 2),
              );
            }
          } else {
            throw error;
          }
        }

        // getDataFromTree does not call componentWillUnmount,
        // Head side effect therefore need to be cleared manually.
        // See https://github.com/gaearon/react-side-effect to learn more about why this is necessary.
        Head.rewind();
      }

      return {
        // Must always pass `pageProps` to satisfy the type constraint:
        //   TWrappedAppInitialProps extends AppInitialProps
        pageProps: wrappedAppInitialProps.pageProps,
        // Extract query data from the Apollo store
        apolloState: apolloClient.cache.extract(),
        wrappedAppInitialProps: wrappedAppInitialProps,
      };
    }
    private apolloClient: ApolloClient<NormalizedCacheObject>;
    constructor(
      props: AppProps &
        TWrappedAppParams &
        AppWithApolloClientInitialProps<TWrappedAppInitialProps>,
    ) {
      super(props);
      // `getDataFromTree` renders the component first, the client is passed off as a property.
      // After that rendering is done using Next's normal rendering pipeline
      this.apolloClient = createApolloClient(props, props.apolloState);
    }

    render() {
      const { wrappedAppInitialProps, ...props } = this.props;

      // TODO: remove the following type assertion once proper spread types are implemented:
      // https://github.com/Microsoft/TypeScript/issues/10727
      const waProps: AppProps & TWrappedAppParams = props as AppProps & TWrappedAppParams;

      const waiProps: TWrappedAppInitialProps = wrappedAppInitialProps;
      return <WrappedApp {...waProps} {...waiProps} apolloClient={this.apolloClient} />;
    }
  }

  const AWC: NextComponentType<
    AppContext & TWrappedAppParams,
    AppWithApolloClientInitialProps<TWrappedAppInitialProps>,
    AppProps & TWrappedAppParams & AppWithApolloClientInitialProps<TWrappedAppInitialProps>
  > = AppWithApolloClient;

  return AWC;
};

export default appWithApolloClient;
