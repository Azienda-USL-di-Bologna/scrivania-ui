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
export const INTIMUS_LOCALHOST_PORT = "1339";
export const LOCALHOST_PDD_PORT = "8080";
export const LOGIN_ROUTE: string = "/login";
export const HOME_ROUTE: string = "/homepage";
export const SCRIVANIA_ROUTE: string = "/scrivania";
export const ATTIVITA_ROUTE: string = "/attivita";
export const MAX_CHARS_100 = 100;
export const BABELMAN_URL = "https://babelman-auslbo.avec.emr.it/";
export const APPLICATION = "scrivania";

export enum BaseUrlType {
    Scrivania,
    ScrivaniaCommonParameters,
    Baborg,
    Configurazione,
    ConfigurazioneImpostazioniApplicazioni,
    Login,
    Intimus
}

export const BaseUrls: Map<BaseUrlType, string> = new Map<BaseUrlType, string>([
    [BaseUrlType.Scrivania,  "/internauta-api/resources/scrivania"],
    [BaseUrlType.ScrivaniaCommonParameters,  "/internauta-api/resources/scrivania/getScrivaniaCommonParameters"],
    [BaseUrlType.Baborg, "/internauta-api/resources/baborg"],
    [BaseUrlType.Configurazione, "/internauta-api/resources/configurazione"],
    [BaseUrlType.ConfigurazioneImpostazioniApplicazioni, "/internauta-api/resources/configurazione/custom/setImpostazioniApplicazioni"],
    [BaseUrlType.Login, "/internauta-api/login"],
    [BaseUrlType.Intimus, ""]
]);

export function getInternautaUrl(type: BaseUrlType): string {
    if (!BaseUrls.has(type)) {
        throw new Error("Failed to obtain internauta url, type does not exists!");
    }

    let port;
    const wl = window.location;
    if (wl.hostname === "localhost" && type === BaseUrlType.Intimus) {
        return "https://gdml.internal.ausl.bologna.it";
    }
        // if (type === BaseUrlType.Intimus) {
        //     port = INTIMUS_LOCALHOST_PORT;
        // } else {
        //     port = LOCALHOST_PORT;
        // }
    if (wl.hostname === "localhost") {
        port = LOCALHOST_PORT;
    } else {
        port = wl.port;
    }

    const out: string = wl.protocol + "//" + wl.hostname + ":" + port + BaseUrls.get(type);

    console.log(out);

    return out;
}


export const ENTITIES = {
    azienda: "azienda",
    attivita: "attivita",
    applicazione: "applicazione",
    menu: "menu",
    attivitaFatta: "attivitafatta"
};

export const CONTROLLERS_ENDPOINT = {
    FIRMONE_URLS: "/getFirmoneUrls",
    PRENDONE_URLS: "/getPrendoneUrls",
    CANCELLA_NOTIFICHE: "/cancellaNotifiche",
    GET_MENU_SCRIVANIA: "/getMenuScrivania"
};

export const COMMANDS = {
    scrivania_local: "scrivania_local",
    gedi_local: "gedi_local",
    open_prendone_local: "open_prendone_local",
    open_firmone_local: "open_firmone_local"
};

export const ATTIVITA_STATICHE_DESCRIPTION = {
    scrivania: "Scrivania",
    elenco_delibere: "Elenco Delibere",
    nuova_delibera: "Nuova Delibera",
    elenco_determine: "Elenco Determine",
    nuova_determina: "Nuova Determina",
    gipi: "GiPi",
    elenco_documenti: "Elenco Documenti",
    nuovo_protocollo_in_entrata_riservato: "Nuovo Protocollo In Entrata Riservato",
    nuovo_protocollo_in_uscita_riservato: "Nuovo Protocollo In Uscita Riservato",
    nuovo_protocollo_in_uscita: "Nuovo Protocollo In Uscita",
    nuovo_protocollo_in_entrata: "Nuovo Protocollo In Entrata",
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

export const COMMON_PARAMETERS = {
    BABEL_APPLICATION: "BABEL_APPLICATION"
};



