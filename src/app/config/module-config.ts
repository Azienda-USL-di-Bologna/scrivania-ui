import { NTJWTModuleConfig } from '@bds/nt-jwt-login'
import { getInternautaUrl, LOGIN_ROUTE, HOME_ROUTE, LOCALHOST_PORT, BaseUrlType } from '../../environments/app-constants';

export const loginModuleConfig: NTJWTModuleConfig = {
    loginURL: "" /*getInternautaUrl(BaseUrlType.Login)*/,
    loginComponentRoute: LOGIN_ROUTE,
    homeComponentRoute: HOME_ROUTE,
    localhostPort: LOCALHOST_PORT,
    applicazione: "scrivania"
};
