import { NTJWTModuleConfig } from "@bds/nt-jwt-login";
import { LOGIN_ROUTE, HOME_ROUTE, LOCALHOST_PORT, APPLICATION, SCRIVANIA_ROUTE } from "../../environments/app-constants";

export const loginModuleConfig: NTJWTModuleConfig = {
    loginURL: "" /*getInternautaUrl(BaseUrlType.Login)*/,
    loginComponentRoute: LOGIN_ROUTE,
    homeComponentRoute: HOME_ROUTE,
    localhostPort: LOCALHOST_PORT,
    applicazione: APPLICATION,
    logoutRedirectRoute: SCRIVANIA_ROUTE,
    sessionExpireSeconds: 1800, // 0 = distattivato
    pingInterval: 60 // 0 disattivato
};
