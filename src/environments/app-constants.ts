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

export const CONTROLLERS_ENDPOINT = {
    FIRMONE_URLS: "/getFirmoneUrls",
    PRENDONE_URLS: "/getPrendoneUrls",
    CANCELLA_NOTIFICHE: "/cancellaNotifiche",
    GET_MENU_SCRIVANIA: "/getMenuScrivania",
    GET_DATI_BOLLO_AZIENDA: "/getDatiBolloByAzienda",
    GET_DATI_RACCOLTA_SEMPLICE: "/getRaccoltaSemplice",
    GET_FASCICOLI_ARGO: "/getFascicoliArgo",
    GET_DOCUMENTI_ARGO: "/getDocumentiArgo",
    GET_STORICO: "/storico",
    ANNULLAMENTO_URL: "/annullamento",
    RICERCA_RACCOLTA: "/ricerca",
    CREATE_RS: "/createRS",
    DOWNLOAD: "/downloadAllegato",
    TIPOLOGIE: "/getTipologia"
};

export const COMMANDS = {
    scrivania_local: "scrivania_local",
    gedi_local: "gedi_local",
    open_prendone_local: "open_prendone_local",
    open_firmone_local: "open_firmone_local"
};

export const COMMON_PARAMETERS = {
    BABEL_APPLICATION: "BABEL_APPLICATION"
};

export const CUSTOM_SERVER_METHODS = {
    saveAllegato: "saveAllegato",
    downloadAttachment: "downloadAttachment",
    downloadAllAttachments: "downloadAllAttachments",
    cancellaattivita: "cancellaattivita"
  };
