import { FILTER_TYPES } from "@bds/next-sdr";

export const ColumnsNormal = [
  {
    // E' l'insieme di priorità e tipo attività
    field: "priorita",
    width: "37px",
    padding: 0,
    label: "tipo attività",
    minWidth: "37px",
  },
  {
    field: "idAzienda.nome",
    header: "Ente",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "98px",
    minWidth: "98px",
    label: "ente",
  },
  {
    field: "idApplicazione.nome",
    header: "App",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "93px",
    minWidth: "93px",
    label: "applicazione",
  },
  {
    field: "provenienza",
    header: "Da",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "140px",
    minWidth: "140px",
    label: "provenienza",
  },
  {
    field: "oggetto",
    header: "Oggetto",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "auto",
    minWidth: "200px",
    label: "oggetto",
  },
  {
    field: "data",
    header: "Data",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    fieldType: "DateTime",
    filterWidget: "Calendar",
    ariaLabelDescription: "Colonna Data, Cella filtro",
    width: "117px",
    minWidth: "117px",
    label: "data",
  },
  {
    field: "descrizione",
    header: "Tipo",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "120px",
    minWidth: "120px",
    label: "tipo",
  },
  {
    // colonna azione
    field: "azione",
    width: "60px",
    minWidth: "60px",
    label: "azione",
  },
  {
    // colonna posso procedere
    width: "30px",
    minWidth: "30px",
    label: "check procedibilità",
  },
  {
    // colonna trash
    width: "30px",
    minWidth: "30px",
    label: "elimina",
  },
  {
    // colonna note
    width: "30px",
    minWidth: "30px",
    label: "note",
  },
  /* {
    // colonna anteprima
    field: "anteprima",
    width: "32px",
    minWidth: "32px",
    label: "anteprima",
    visibility: "visible",
    display: "",
  }, */
];

export const ColumnsReordered = [
  {
    // E' l'insieme di priorità e tipo attività
    field: "priorita",
    width: "37px",
    padding: 0,
    label: "tipo attività",
    minWidth: "37px",
  },
  {
    field: "oggetto",
    header: "Oggetto",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "auto",
    minWidth: "200px",
    label: "oggetto",
  },
  {
    field: "data",
    header: "Data",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    fieldType: "DateTime",
    filterWidget: "Calendar",
    ariaLabelDescription: "Colonna Data, Cella filtro",
    width: "117px",
    minWidth: "117px",
    label: "data",
  },
  {
    // colonna azione
    field: "azione",
    width: "60px",
    minWidth: "60px",
    label: "azione",
  },
  {
    field: "descrizione",
    header: "Tipo",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "120px",
    minWidth: "120px",
    label: "tipo",
  },
  {
    field: "idAzienda.nome",
    header: "Ente",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "98px",
    minWidth: "98px",
    label: "ente",
  },
  {
    field: "idApplicazione.nome",
    header: "App",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "93px",
    minWidth: "93px",
    label: "applicazione",
  },
  {
    field: "provenienza",
    header: "Da",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "140px",
    minWidth: "140px",
    label: "provenienza",
  },
  {
    // colonna posso procedere
    width: "30px",
    minWidth: "30px",
    label: "check procedibilità",
  },
  {
    // colonna trash
    width: "30px",
    minWidth: "30px",
    label: "elimina",
  },
  {
    // colonna note
    width: "30px",
    minWidth: "30px",
    label: "note",
  },
  /* {
    // colonna anteprima
    field: "anteprima",
    width: "32px",
    minWidth: "32px",
    label: "anteprima",
    visibility: "visible",
    display: "none",
  } */
];
