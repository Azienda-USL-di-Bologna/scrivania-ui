import { EntitiesConfiguration } from '@bds/nt-communicator';

// ========================= Url =====================================
// export const ODATA_BASE_URL: string = environment.odataStoreRootUrl;
let hostname: string = window.location.hostname;
const originalPort: string = window.location.port;
export const LOCALHOST_PORT = "10007";

const port: string = hostname === "localhost" ? ":" + LOCALHOST_PORT : ":" + originalPort; // qui c'era : ":443"

export const BASE_URL: string = window.location.protocol + "//" + hostname + port + "/scrivania-api/resources";


export const ENTITIES = {
    azienda: "azienda",
    attivita: 'attivita',
    applicazione: 'applicazione'
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
    }
}

export const ENTITIES_CONFIGURATION: EntitiesConfiguration = {
    azienda: {
        path: "azienda",
        standardProjections: PROJECTIONS.azienda.standardProjections,
        customProjections: PROJECTIONS.azienda.standardProjections,
    },
    attivita: {
        path: "attivita",
        standardProjections: PROJECTIONS.attivita.standardProjections,
        customProjections: PROJECTIONS.attivita.standardProjections,
    }
}