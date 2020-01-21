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
