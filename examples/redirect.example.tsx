import React from 'react';

import { redirect } from '@yolkai/next-utils';
import { MyAppPageContext } from './App';

/**
 * A Next.js page which logs out the user by redirecting them to the root.
 */
export class LogoutPage extends React.Component {
  static async getInitialProps(ctx: MyAppPageContext) {
    redirect('/', ctx);
  }

  render() {
    return <p>Logged out; redirecting back to the login page</p>;
  }
}

export default LogoutPage;
