import { NextPageContext } from 'next';
import React from 'react';

import redirect, { RedirectCode } from './redirect';

/**
 * Return a Next.js page component which redirects to the given URL using the given HTTP status code.
 */
const makeRedirectPage = <Context extends NextPageContext>(code: RedirectCode, target: string) => {
  return class RedirectPage extends React.Component {
    static async getInitialProps(ctx: Context) {
      const { res } = ctx;
      redirect(code, target, res);
      return {};
    }

    render() {
      return null;
    }
  };
};

export default makeRedirectPage;
