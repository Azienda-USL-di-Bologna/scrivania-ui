import { NTJWTModuleConfig } from '@bds/nt-jwt-login'
import { LOGIN_RELATIVE_URL, LOGIN_ROUTE, HOME_ROUTE, LOCALHOST_PORT } from '../../environments/app-constants';

export const loginModuleConfig: NTJWTModuleConfig = {
    relativeURL: LOGIN_RELATIVE_URL,
    loginComponentRoute: LOGIN_ROUTE,
    homeComponentRoute: HOME_ROUTE,
    localhostPort: LOCALHOST_PORT
};
