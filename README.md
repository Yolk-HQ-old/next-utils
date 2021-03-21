<div align="center">

# next-utils

A set of Next.js utilities to make your life easier.

ATTENTION: This project is no longer maintained.

</div>

---

[![Actions Status][build-badge]][build]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs] [![Code of Conduct][coc-badge]][coc]

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
- [Usage](#usage)
  - [appWithApolloClient](#appwithapolloclient)
  - [appWithSentry](#appWithSentry)
  - [appWithLingui](#appWithLingui)
  - [appWithCookies](#appwithcookies)
  - [withAuthentication](#withauthentication)
  - [checkAuthenticated](#checkauthenticated)
  - [redirect](#redirect)
  - [RouterContext](#RouterContext)
- [Other Solutions](#other-solutions)
- [LICENSE](#license)

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

```sh
npm install @yolkai/next-utils
```

## Note

NOTE: Using any of these Higher-Order-Components will disable [Automatic Static Optimization](https://nextjs.org/docs/old#automatic-static-optimization) (statically built pages), since the Higher-Order-Component forces every page to implement `getInitialProps`.

### 🔮 **Apollo Client**

#### appWithApolloClient

[Example Usage](https://github.com/Yolk-HQ/next-utils/tree/master/examples/appWithApolloClient.example.tsx)

[Code](https://github.com/Yolk-HQ/next-utils/tree/master/src/internal/appWithApolloClient.tsx)

React higher-order component (HoC) which wraps the App component and:

- Performs the page's initial GraphQL request on the server, and serializes the result to be used as the initial Apollo state once the client mounts.
- Passes the Apollo client to the wrapped App component.

### 🔭 **Sentry**

[Example Usage](https://github.com/Yolk-HQ/next-utils/tree/master/examples/appWithSentry.example.tsx)

#### appWithSentry

[Code](https://github.com/Yolk-HQ/next-utils/tree/master/src/internal/appWithSentry.tsx)

React higher-order component (HoC) which wraps the App component and captures any exceptions thrown in `getInitialProps` and emits them to Sentry.

#### initSentry

[Code](https://github.com/Yolk-HQ/next-utils/tree/master/src/internal/initSentry.tsx)

Initializes Sentry and creates a `captureException` function which can be used with `appWithSentry`. This function is unique and adds extra Next.js information to captured exceptions.

### 📚 **LinguiJS**

#### appWithLingui

[Example Usage](https://github.com/Yolk-HQ/next-utils/tree/master/examples/appWithLingui.example.tsx)

[Code](https://github.com/Yolk-HQ/next-utils/tree/master/src/internal/appWithLingui.tsx)

React higher-order component (HoC) that wraps the App component in LinguiJs's `I18nProvider` component.

It will then detect:

1. The best language to use based on the incoming request
2. Load the catalog for that language, and supply it to the `I18nProvider`

### 🍪 **React Cookies**

#### appWithCookies

[Example Usage](https://github.com/Yolk-HQ/next-utils/tree/master/examples/appWithCookies.example.tsx)

[Code](https://github.com/Yolk-HQ/next-utils/tree/master/src/internal/appWithCookies.tsx)

React higher-order component (HoC) which wraps the App component and passes a cookies access object to the App component.

### 🔏 **Authentication**

#### makeRedirectPage

[Example Usage](https://github.com/Yolk-HQ/next-utils/tree/master/examples/makeRedirectPage.example.tsx)

[Code](https://github.com/Yolk-HQ/next-utils/tree/master/src/internal/makeRedirectPage.tsx)

Next.js Page Component which redirects to the given URL using the given HTTP status code.

#### redirect

[Example Usage](https://github.com/Yolk-HQ/next-utils/tree/master/examples/redirect.example.tsx)

[Code](https://github.com/Yolk-HQ/next-utils/tree/master/src/internal/redirect.ts)

A small utility function helpful when redirecting users both on the server and the client.

### Testing

#### RouterContext

[Example Usage](https://github.com/Yolk-HQ/next-utils/tree/master/examples/RouterContext.example.tsx)

[Code](https://github.com/Yolk-HQ/next-utils/tree/master/src/internal/RouterContext.ts)

A React Context object which is very helpful when using Next.js with preview tools such as Storybook. Allows for components to use `<Link>` / `Router` provided by an ancestor component without errors.

## Other Solutions

Some of these solutions are based on the examples found [the official Next.js examples repo](https://github.com/zeit/next.js/tree/master/examples).

If you see an improvment please [make a pull request][prs].

## Used in Production By

[Yolk AI](https://www.yolk.ai/)

## Contributors

!!TO BE FILLED!!

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://github.com/Yolk-HQ/next-utils/workflows/Test/badge.svg
[build]: https://github.com/Yolk-HQ/next-utils/actions
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
