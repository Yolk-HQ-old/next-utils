/**
 * React higher-order component (HoC) that wraps the given component
 * in LinguiJs's `I18nProvider` component.
 *
 * The required language catalog, supported languages, and default language
 * must be provided by the consumer of this HoC. It will then detect
 * the best language to use based on the incoming request, load
 * the catalog for that language, and supply it to the `I18nProvider`.
 *
 * Additionally, this HoC adds the matched language to the
 * initial props provided by `getInitialProps`.
 *
 * See also:
 *  - https://reactjs.org/docs/higher-order-components.html
 */

import { NextComponentType } from 'next';
import { AppContext, AppProps, AppInitialProps } from 'next/app';
import * as React from 'react';
import accepts from 'accepts';
import { IncomingMessage } from 'http';
import { I18nProvider } from '@lingui/react';
import { Catalog } from '@lingui/core';
const bcp47match = require('bcp-47-match');

export interface AppWithLinguiInitialProps<TWrappedAppInitialProps> extends AppInitialProps {
  language: string;
  catalog: Catalog;
  wrappedAppInitialProps: TWrappedAppInitialProps;
}

interface AppWithLinguiParams {
  language: string;
}

/**
 * @param getCatalog A function that should provide language Catalog
 * @param languages The set of supported languages for translation
 * @param defaultLanguage The default language
 */
const appWithLingui = (
  getCatalog: (language: string) => Promise<Catalog>,
  languages: string[] = ['en'],
  defaultLanguage: string = 'en',
) => <
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
  class AppWithLingui extends React.Component<
    AppProps & TWrappedAppParams & AppWithLinguiInitialProps<TWrappedAppInitialProps>
  > {
    static displayName = `appWithLingui(${wrappedComponentName})`;

    static async getInitialProps(
      ctx: AppContext & TWrappedAppParams,
    ): Promise<AppWithLinguiInitialProps<TWrappedAppInitialProps>> {
      const preferredLanguages = ctx.ctx.req
        ? accepts(ctx.ctx.req as IncomingMessage).languages()
        : getBrowserPreferredLanguages();
      const matchedLanguage = bcp47match.lookup(languages, preferredLanguages) || defaultLanguage;
      const catalog = await getCatalog(matchedLanguage);

      let wrappedAppInitialProps;
      if (WrappedApp.getInitialProps) {
        const wrappedAppCtx: AppContext & TWrappedAppParams & AppWithLinguiParams = {
          ...ctx,
          language: matchedLanguage,
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
        language: matchedLanguage,
        catalog,
        wrappedAppInitialProps: wrappedAppInitialProps,
      };
    }
    render() {
      const { wrappedAppInitialProps, language, catalog, ...props } = this.props;

      // TODO: remove the following type assertion once proper spread types are implemented:
      // https://github.com/Microsoft/TypeScript/issues/10727
      const waProps: AppProps & TWrappedAppParams = props as AppProps & TWrappedAppParams;

      const waiProps: TWrappedAppInitialProps = wrappedAppInitialProps;

      return (
        <I18nProvider catalogs={{ [language]: catalog }} language={language}>
          <WrappedApp {...waProps} {...waiProps} language={language} />
        </I18nProvider>
      );
    }
  }

  const AWL: NextComponentType<
    AppContext & TWrappedAppParams,
    AppWithLinguiInitialProps<TWrappedAppInitialProps>,
    AppProps & TWrappedAppParams & AppWithLinguiInitialProps<TWrappedAppInitialProps>
  > = AppWithLingui;

  return AWL;
};

export default appWithLingui;

/**
 * Return the list of languages which the current user's browser prefers,
 * as a list of BCP 47 language tags.
 *
 * `navigator.languages` is preferred if available, otherwise falling back to the older
 * `navigator.language` API, or the IE-specific `navigator.browserLanguage` /
 * `navigator.userLanguage` APIs.
 */
export const getBrowserPreferredLanguages = (): string[] => {
  if (!navigator) {
    throw new Error(`getBrowserPreferredLanguages() was called outside of a browser environment.`);
  }
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    return [...navigator.languages];
  }
  if (navigator.language) {
    return [navigator.language];
  }
  if ((navigator as any).browserLanguage) {
    return [(navigator as any).browserLanguage];
  }
  if ((navigator as any).userLanguage) {
    return [(navigator as any).userLanguage];
  }
  return [];
};
