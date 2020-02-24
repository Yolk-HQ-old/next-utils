import React from 'react';
import { LinkProps } from 'next/link';
import { NextRouter } from 'next/router';

/**
 * Stub implementation of Link used by default if this context is consumed without a provider.
 * This will _not_ work in a Next.js application, but is useful as a default in tests/previews.
 */
const StubLink: React.FC<LinkProps> = ({ children, href }) =>
  React.cloneElement(React.Children.only(children) as any, { href });

/**
 * Stub implementation of Router used by default if this context is consumed without a provider.
 * This will _not_ work in a Next.js application, but is useful as a default in tests/previews.
 */
const stubRouter: NextRouter = {
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  isFallback: false,
  push() {
    throw new Error('Not implemented');
  },
  replace() {
    throw new Error('Not implemented');
  },
  reload() {
    throw new Error('Not implemented');
  },
  back() {
    throw new Error('Not implemented');
  },
  prefetch() {
    throw new Error('Not implemented');
  },
  beforePopState() {
    throw new Error('Not implemented');
  },
  events: {
    on() {
      throw new Error('Not implemented');
    },
    off() {
      throw new Error('Not implemented');
    },
    emit() {
      throw new Error('Not implemented');
    },
  },
};

interface RouterContextType {
  Link: React.ComponentType<LinkProps>;
  router: NextRouter;
}

/**
 * React Context enabling components to use <Link> / Router provided by an ancestor component,
 * rather than directly from 'next/link' or 'next/router'. This is useful when testing or previewing components
 * (e.g. using Storybook), as importing 'next/link' directly results in errors such as:
 *
 *   Uncaught Error: No router instance found.
 *   You should only use "next/router" inside the client side of your app.
 */
const RouterContext = React.createContext<RouterContextType>({
  Link: StubLink,
  router: stubRouter,
});

export default RouterContext;
