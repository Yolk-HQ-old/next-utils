<center>

# next-utils

<img height="80" width="80" alt="steak" src="https://raw.githubusercontent.com/Yolk-HQ/next-utils/master/other/steak.png" />
<img height="80" width="80" alt="eggs" src="https://raw.githubusercontent.com/Yolk-HQ/next-utils/master/other/eggs.png" />

A set of Next.js utilities to make your life easier.

[**Read the docs**]()

---

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package] [![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs] [![Code of Conduct][coc-badge]][coc]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

---

## Overview

React [Higher-Order Components](https://reactjs.org/docs/higher-order-components.html) for use with [Next.js](https://nextjs.org/), enabling simple, server-side-render-compatible configuration of functionality such as:

- [Apollo Client](https://github.com/apollographql/apollo-client) + [react-apollo](https://github.com/apollographql/react-apollo)
- [Sentry](https://sentry.io/for/javascript/)
- [LinguiJS](https://github.com/lingui/js-lingui)
- [react-cookies](https://github.com/bukinoshita/react-cookies)

## Table of Contents

- [Installation](#installation)
  - [With typescript](#with-typescript)
- [Usage](#usage)
  - [appWithApolloClient](#appwithapolloclient)
  - [appWithSentry](#appWithSentry)
  - [appWithLingui](#appWithLingui)
  - [appWithCookies](#appwithcookies)
  - [withAuthentication](#withauthentication)
  - [checkAuthenticated](#checkauthenticated)
- [Other Solutions](#other-solutions)
- [LICENSE](#license)

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

```sh
npm install next-utils
```

### With TypeScript

It just works! This module provides TypeScript declarations!

### appWithApolloClient

React higher-order component (HoC) which wraps the App component and:

- Performs the page's initial GraphQL request on the server, and serializes the result to be used as the initial Apollo state once the client mounts.
- Passes the Apollo client to the wrapped App component.

```typescript
import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { Cookies } from 'react-cookie';
import { NextContext } from 'next';
import { AppInitialProps } from 'next/app';
import { DefaultQuery } from 'next/router';

import { appWithApolloClient } from '@yolkai/next-utils';

interface MyAppParams {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

type MyAppProps = AppProps & MyAppParams;
type MyAppContext = NextAppContext & MyAppParams;

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
```

NOTE: Using this HoC will disable [Automatic Static Optimization](https://nextjs.org/docs/old#automatic-static-optimization) (statically built pages), since the HoC forces every page to implement getInitialProps.

### appWithSentry

TODO

### appWithLingui

TODO

### appWithCookies

React higher-order component (HoC) which wraps the App component and passes a cookies access object to the App component.

```typescript
import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { Cookies } from 'react-cookie';
import { NextContext } from 'next';
import { AppInitialProps } from 'next/app';
import { DefaultQuery } from 'next/router';
import App, { AppContext, , AppProps } from 'next/app';

interface MyAppParams {
  cookies: Cookies;
  isServer: boolean;
}

type MyAppProps = AppProps & MyAppParams;
type MyAppContext = NextAppContext & MyAppParams;

export type MyAppPageContext<Q extends DefaultQuery = DefaultQuery> = NextContext<Q> & MyAppParams;

export class MyApp extends App<MyAppProps> {
  static async getInitialProps({
    ctx,
    Component,
    cookies,
    isServer,
  }: MyAppContext): Promise<AppInitialProps> {
    let pageProps;
    if (Component.getInitialProps) {
      const c: MyAppPageContext = { ...ctx, apolloClient, cookies, isServer };
      pageProps = await Component.getInitialProps(c);
    } else {
      pageProps = {};
    }

    return { pageProps };
  }
}

export default appWithCookies(MyApp);
```

### checkAuthenticated & withAuthentication

#### checkAuthenticated

TODO

#### withAuthentication

A higher-order component which ensures that the viewer is authenticated, using the access token
stored in a cookie "token". If the access token is invalid, expired, or missing, the viewer is
redirected to the login application.

For this to work you need to have a `/auth_callback` page defined in the application.

```typescript
import getConfig from 'next/config';
import { withAuthentication } from '@yolkai/next-utils';

import checkAuthenticated from '../../common/checkAuthenticated';

class FlowPage extends React.Component<FlowPageProps, FlowPageState> {
  ...
}

const { authUrl, host, protocol } = getConfig().publicRuntimeConfig;
const AuthenticationConfig = {
  authUrl,
  host,
  protocol,
  checkAuthenticated,
};

export default withAuthentication(AuthenticationConfig)(FlowPage);

```

Note:

This HoC may only be applied to Next.js page components, since getInitialProps() has no effect on
non-page components.

### makeAuthCallbackPage

TODO

### makeRedirectPage

TODO

### RouterContext

TODO

## Other Solutions

I'm not aware of any, if you are please [make a pull request][prs] and add it
here!

## Used By

[Yolk AI](https://www.yolk.ai/)

## Contributors

!!TO BE FILLED!!

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/yolk-hq/next-utils.svg?style=flat-square
[build]: https://travis-ci.org/yolk-hq/next-utils
[coverage-badge]: https://img.shields.io/codecov/c/github/yolk-hq/next-utils.svg?style=flat-square
[coverage]: https://codecov.io/github/yolk-hq/next-utils
[version-badge]: https://img.shields.io/npm/v/next-utils.svg?style=flat-square
[package]: https://www.npmjs.com/package/@yolkai/next-utils
[downloads-badge]: https://img.shields.io/npm/dm/@yolkai/next-utils.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/@yolkai/next-utils
[license-badge]: https://img.shields.io/npm/l/@yolkai/next-utils.svg?style=flat-square
[license]: https://github.com/yolk-hq/next-utils/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/yolk-hq/next-utils/blob/master/other/CODE_OF_CONDUCT.md
[github-watch-badge]: https://img.shields.io/github/watchers/yolk-hq/next-utils.svg?style=social
[github-watch]: https://github.com/yolk-hq/next-utils/watchers
[github-star-badge]: https://img.shields.io/github/stars/yolk-hq/next-utils.svg?style=social
[github-star]: https://github.com/yolk-hq/next-utils/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20next-utils%20by%20%40yolkai%20https%3A%2F%2Fgithub.com%2Fyolk-hq%2Fnext-utils%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/testing-library/cypress-testing-library.svg?style=social
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/all-contributors/all-contributors
[dom-testing-library]: https://github.com/testing-library/dom-testing-library
[cypress]: https://www.cypress.io/
