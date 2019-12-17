import { NTJWTModuleConfig, LogoutType } from "@bds/nt-jwt-login";
import { LOGIN_ROUTE, HOME_ROUTE, LOCALHOST_PORT, APPLICATION, SCRIVANIA_ROUTE } from "../../environments/app-constants";

export const loginModuleConfig: NTJWTModuleConfig = {
    loginURL: "" /*getInternautaUrl(BaseUrlType.Login)*/,
    passTokenGeneratorURL: "",
    loginComponentRoute: LOGIN_ROUTE,
    homeComponentRoute: HOME_ROUTE,
    localhostPort: LOCALHOST_PORT,
    applicazione: APPLICATION,
    logoutRedirectRoute: SCRIVANIA_ROUTE,
    loggedOutComponentRoute: null,
    // sessionExpireSeconds: 1800, // 0 = distattivato
    pingInterval: 10, // 0 disattivato, 900 parametro deciso per prod
    // logout type SSO sync oppure local
    logoutType: LogoutType.SSO_SYNC
};
