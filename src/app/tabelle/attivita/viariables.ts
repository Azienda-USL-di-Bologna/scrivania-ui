import { FILTER_TYPES } from "@bds/next-sdr";

export const ColumnsNormal = [
  {
    // E' l'insieme di priorità e tipo attività
    field: "priorita",
    width: "2.313rem",
    padding: 0,
    label: "tipo attività",
    minWidth: "2.313rem",
  },
  {
    field: "idAzienda.nome",
    header: "Ente",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "6.125rem",
    minWidth: "6.125rem",
    label: "ente",
  },
  {
    field: "idApplicazione.nome",
    header: "App",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "5.813rem",
    minWidth: "5.813rem",
    label: "applicazione",
  },
  {
    field: "provenienza",
    header: "Da",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "8.75rem",
    minWidth: "8.75rem",
    label: "provenienza",
  },
  {
    field: "oggetto",
    header: "Oggetto",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "auto",
    minWidth: "12.5rem",
    label: "oggetto",
  },
  {
    field: "data",
    header: "Data",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    fieldType: "DateTime",
    filterWidget: "Calendar",
    ariaLabelDescription: "Colonna Data, Cella filtro",
    width: "7rem",
    minWidth: "7rem",
    label: "data",
  },
  {
    field: "descrizione",
    header: "Tipo",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "8.05rem",
    minWidth: "8.05rem",
    label: "tipo",
  },
  {
    // colonna azione
    field: "azione",
    width: "6rem",
    minWidth: "6rem",
    label: "azione",
  },
  {
    // colonna posso procedere
    width: "1.875rem",
    minWidth: "1.875rem",
    label: "check procedibilità",
  },
  {
    // colonna trash
    width: "1.875rem",
    minWidth: "1.875rem",
    label: "elimina",
  },
  {
    // colonna note
    width: "1.875rem",
    minWidth: "1.875rem",
    label: "note",
  },
  /* {
    // colonna anteprima
    field: "anteprima",
    width: "",
    minWidth: "",
    label: "anteprima",
    visibility: "visible",
    display: "",
  }, */
];

export const ColumnsReordered = [
  {
    // E' l'insieme di priorità e tipo attività
    field: "priorita",
    width: "2.313rem",
    padding: 0,
    label: "tipo attività",
    minWidth: "2.313rem",
  },
  {
    field: "oggetto",
    header: "Oggetto",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "auto",
    minWidth: "12.5rem",
    label: "oggetto",
  },
  {
    field: "data",
    header: "Data",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    fieldType: "DateTime",
    filterWidget: "Calendar",
    ariaLabelDescription: "Colonna Data, Cella filtro",
    width: "7.313rem",
    minWidth: "7.313rem",
    label: "data",
  },
  {
    // colonna azione
    field: "azione",
    width: "3.75rem",
    minWidth: "3.75rem",
    label: "azione",
  },
  {
    field: "descrizione",
    header: "Tipo",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "7.5rem",
    minWidth: "7.5rem",
    label: "tipo",
  },
  {
    field: "idAzienda.nome",
    header: "Ente",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "6.125rem",
    minWidth: "6.125rem",
    label: "ente",
  },
  {
    field: "idApplicazione.nome",
    header: "App",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "5.813rem",
    minWidth: "5.813rem",
    label: "applicazione",
  },
  {
    field: "provenienza",
    header: "Da",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "8.75rem",
    minWidth: "8.75rem",
    label: "provenienza",
  },
  {
    // colonna posso procedere
    width: "1.875rem",
    minWidth: "1.875rem",
    label: "check procedibilità",
  },
  {
    // colonna trash
    width: "1.875rem",
    minWidth: "1.875rem",
    label: "elimina",
  },
  {
    // colonna note
    width: "1.875rem",
    minWidth: "1.875rem",
    label: "note",
  },
  /* {
    // colonna anteprima
    field: "anteprima",
    width: "",
    minWidth: "",
    label: "anteprima",
    visibility: "visible",
    display: "none",
  } */
];
