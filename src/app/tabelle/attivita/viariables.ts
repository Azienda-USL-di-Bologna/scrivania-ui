import { FILTER_TYPES } from "@bds/nt-communicator";

export const ColumnsNormal = [
  {
    // E' l'insieme di priorità e tipo attività
    width: "30px",
    minWidth: "30px"
  },
  {
    field: "idAzienda.nome",
    header: "Ente",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "85px",
    minWidth: "85px"
  },
  {
    field: "idApplicazione.nome",
    header: "App",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "80px",
    minWidth: "80px"
  },
  {
    field: "provenienza",
    header: "Da",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "140px",
    minWidth: "140px"
  },
  {
    field: "oggetto",
    header: "Oggetto",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "auto",
    minWidth: "200px"
  },
  {
    field: "data",
    header: "Data",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    fieldType: "DateTime",
    filterWidget: "Calendar",
    ariaLabelDescription: "Colonna Inserimento, Cella filtro",
    width: "100px",
    minWidth: "100px"
  },
  {
    field: "descrizione",
    header: "Tipo",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "120px",
    minWidth: "120px"
  },
  {
    // colonna azione
    field: "azione",
    width: "60px",
    minWidth: "60px"
  },
  {
    // colonna posso procedere
    width: "30px",
    minWidth: "30px"
  },
  {
    // colonna trash
    width: "30px",
    minWidth: "30px"
  },
  {
    // colonna note
    width: "30px",
    minWidth: "30px"
  }
];

export const ColumnsReordered = [
  {
    // E' l'insieme di priorità e tipo attività
    width: "30px",
    minWidth: "30px"
  },
  {
    field: "oggetto",
    header: "Oggetto",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "auto",
    minWidth: "200px"
  },
  {
    field: "data",
    header: "Data",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    fieldType: "DateTime",
    filterWidget: "Calendar",
    ariaLabelDescription: "Colonna Inserimento, Cella filtro",
    width: "100px",
    minWidth: "100px"
  },
  {
    // colonna azione
    field: "azione",
    width: "60px",
    minWidth: "60px"
  },
  {
    field: "descrizione",
    header: "Tipo",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "120px",
    minWidth: "120px"
  },
  {
    field: "idAzienda.nome",
    header: "Ente",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "85px",
    minWidth: "85px"
  },
  {
    field: "idApplicazione.nome",
    header: "App",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "80px",
    minWidth: "80px"
  },
  {
    field: "provenienza",
    header: "Da",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    width: "140px",
    minWidth: "140px"
  },
  {
    // colonna posso procedere
    width: "30px",
    minWidth: "30px"
  },
  {
    // colonna trash
    width: "30px",
    minWidth: "30px"
  },
  {
    // colonna note
    width: "30px",
    minWidth: "30px"
  }
];
