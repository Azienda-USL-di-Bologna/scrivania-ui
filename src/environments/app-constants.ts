import { EntitiesConfiguration } from "@bds/nt-communicator";

// ========================= Url =====================================
// export const ODATA_BASE_URL: string = environment.odataStoreRootUrl;

/*
const hostname: string = window.location.hostname;
const originalPort: string = window.location.port;
const port: string = hostname === "localhost" ? ":" + LOCALHOST_PORT : ":" + originalPort; // qui c'era : ":443"

export const RELATIVE_BASE_URL: string = "/internauta-api/resources/scrivania";
export const BASE_URL: string = window.location.protocol + "//" + hostname + port + RELATIVE_BASE_URL;
export const LOGIN_RELATIVE_URL: string = "/internauta-api/login";
*/

export const LOCALHOST_PORT = "10005";
export const LOGIN_ROUTE: string = "/login";
export const HOME_ROUTE: string = "/homepage";
export const SCRIVANIA_ROUTE: string = "/scrivania";

export enum BaseUrlType {
    Scrivania,
    Baborg,
    Login,
    Logout
}

export const BaseUrls: Map<BaseUrlType, string> = new Map<BaseUrlType, string>([
    [BaseUrlType.Scrivania,  "/internauta-api/resources/scrivania"],
    [BaseUrlType.Baborg, "/internauta-api/resources/baborg"],
    [BaseUrlType.Login, "/internauta-api/login"],
    [BaseUrlType.Logout, "/Shibboleth.sso/Logout"]
]);

export function getInternautaUrl(type: BaseUrlType): string {
    if (!BaseUrls.has(type)) {
        throw new Error("Failed to obtain internauta url, type does not exists!")
    }

    const wl = window.location;
    const out: string = wl.protocol + "//" + wl.hostname + (wl.hostname === "localhost" ? ":" + LOCALHOST_PORT : ":" + wl.port) + BaseUrls.get(type);

    console.log(out);

    return out;
}


export const ENTITIES = {
    azienda: "azienda",
    attivita: "attivita",
    applicazione: "applicazione",
    menu: "menu",
    attivitaFatta: "attivitafatta"
}

export const PROJECTIONS = {
    azienda: {
        standardProjections: {
            aziendaWithPlainFields: "AziendaWithPlainFields",
        },
        customProjections: {}
    },
    attivita: {
        standardProjections: {
            attivitaWithPlainFields: "AttivitaWithPlainFields",
            attivitaWithIdApplicazioneAndIdAzienda: "AttivitaWithIdApplicazioneAndIdAzienda"
        },
        customProjections: {
            attivitaWithIdApplicazioneAndIdAziendaAndTransientFields: "AttivitaWithIdApplicazioneAndIdAziendaAndTransientFields"
        }
    },
    attivitaFatta: {
        standardProjections: {
            attivitaFattaWithPlainFields: "attivitaFattaWithPlainFields",
            attivitaFattaWithIdApplicazioneAndIdAzienda: "AttivitaFattaWithIdApplicazioneAndIdAzienda"
        },
        customProjections: {
            attivitaFattaWithIdApplicazioneAndIdAziendaAndTransientFields: "AttivitaFattaWithIdApplicazioneAndIdAziendaAndTransientFields"
        }
    },
    menu: {
        standardProjections: {
            menuWithPlainFields: "menuWithPlainFields",
            menuWithIdApplicazioneAndIdAzienda: "MenuWithIdApplicazioneAndIdAzienda"
        },
        customProjections: {
            menuWithIdApplicazioneAndIdAziendaAndTransientFields: "MenuWithIdApplicazioneAndIdAziendaAndTransientFields"
        }
    },
    persona: {
        standardProjections: {
            personaWithPlainFields: "PersonaWithPlainFields"
        },
        customProjections: {}
    },
    utente: {
        standardProjections: {
            utenteWithIdAziendaAndIdPersona: "UtenteWithIdAziendaAndIdPersona",
            utenteWithIdAziendaAndIdPersonaAndUtenteStrutturaList: "UtenteWithIdAziendaAndIdPersonaAndUtenteStrutturaList"
        },
        customProjections: {}
    }
}

export const ENTITIES_CONFIGURATION: EntitiesConfiguration = {
    azienda: {
        path: "azienda"
    },
    attivita: {
        path: "attivita"
    },
    attivitafatta: {
        path: "attivitafatta"
    },
    menu: {
        path: "menu"
    },
    persona: {
        path: "persona"
    },
    utente: {
        path: "utente"
    }
};

export const AFFERENZA_STRUTTURA = {
    DIRETTA: 1,
    FUNZIONALE: 3,
    UNIFICATA: 9,
    TEST: 7
};
