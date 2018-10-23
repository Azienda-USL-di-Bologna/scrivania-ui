import { EntitiesConfiguration } from '@bds/nt-communicator';

// ========================= Url =====================================
// export const ODATA_BASE_URL: string = environment.odataStoreRootUrl;
let hostname: string = window.location.hostname;
const originalPort: string = window.location.port;
export const LOCALHOST_PORT = "10005";

const port: string = hostname === "localhost" ? ":" + LOCALHOST_PORT : ":" + originalPort; // qui c'era : ":443"

export const RELATIVE_BASE_URL: string = "/internauta-api/resources/scrivania";
export const BASE_URL: string = window.location.protocol + "//" + hostname + port + RELATIVE_BASE_URL;
export const LOGIN_RELATIVE_URL: string = "/internauta-api/login";
export const LOGIN_ROUTE: string = "/login";
export const HOME_ROUTE: string = "/homepage";
export const LOGOUT_RELATIVE_URL: string = "/Shibboleth.sso/Logout";
export const LOGOUT_URL = window.location.protocol + "//" + hostname + port + LOGOUT_RELATIVE_URL;


export const ENTITIES = {
    azienda: "azienda",
    attivita: 'attivita',
    applicazione: 'applicazione',
    menu: 'menu'
}

export const PROJECTIONS = {
    azienda: {
        standardProjections: {
            aziendaWithPlainFields: "aziendaWithPlainFields",
        }, 
        customProjections: {}
    },
    attivita: {
        standardProjections: {
            attivitaWithPlainFields: "attivitaWithPlainFields",
            AttivitaWithIdApplicazioneAndIdAzienda: "AttivitaWithIdApplicazioneAndIdAzienda"
        }, 
        customProjections: {}
    },
    menu: {
        standardProjections: {
            menuWithPlainFields: "menuWithPlainFields",
            menuWithIdApplicazioneAndIdAzienda: "MenuWithIdApplicazioneAndIdAzienda"
        }, 
        customProjections: {}
    },
}

export const ENTITIES_CONFIGURATION: EntitiesConfiguration = {
    azienda: {
        path: "azienda",
        // standardProjections: PROJECTIONS.azienda.standardProjections,
        // customProjections: PROJECTIONS.azienda.standardProjections,
    },
    attivita: {
        path: "attivita",
        // standardProjections: PROJECTIONS.attivita.standardProjections,
        // customProjections: PROJECTIONS.attivita.standardProjections,
    },
    menu: {
        path: "menu",
        // standardProjections: PROJECTIONS.menu.standardProjections,
        // customProjections: PROJECTIONS.menu.standardProjections,
    },
}