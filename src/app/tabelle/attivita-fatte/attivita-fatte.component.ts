import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList, ViewChild } from "@angular/core";
import { DatePipe } from "@angular/common";
import { LazyLoadEvent } from "primeng-lts/api";
import { FILTER_TYPES, SORT_MODES, LOCAL_IT } from "@bds/nt-communicator";
import { buildLazyEventFiltersAndSorts, buildPagingConf } from "@bds/primeng-plugin";
import { AttivitaFatteService } from "./attivita-fatte.service";
import { PROJECTIONS } from "../../../environments/app-constants";
import { AttivitaFatta } from "@bds/ng-internauta-model";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Subscription } from "rxjs";
import { FiltersAndSorts, SortDefinition, FilterDefinition, PagingConf } from "@nfa/next-sdr";
import { Calendar } from "primeng-lts/calendar";
import { Table } from "primeng-lts/table";

@Component({
  selector: "app-attivita-fatte",
  templateUrl: "./attivita-fatte.component.html",
  styleUrls: ["./attivita-fatte.component.css"],
  providers: [DatePipe]
})
export class AttivitaFatteComponent implements OnInit {

  public attivitaFatte: AttivitaFatta[];
  public totalRecords: number;
  public localIt = LOCAL_IT;

  public dataRange: any = {};
  private previousEvent: LazyLoadEvent;
  private initialFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  private lazyLoadFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  public loggedUser: UtenteUtilities;
  public loading: boolean = true; // lasciare questo a true se no da errore in console al primo caricamento delle attività
  public selectedRowIndex: number = -1;
  private subscriptions: Subscription[];

  public _rows = 20;

  @ViewChildren("calGen") private _calGen: QueryList<Calendar>;
  @ViewChild("dt") private dataTable: Table;

  private _idAzienda: number = -1;
  @Input("idAzienda")
  set idAzienda(idAzienda: number) {
    this._idAzienda = idAzienda;
    if (!this._idAzienda) {
      this._idAzienda = -1;
    }
    if ( !this.loggedUser ) { return; }
    if (this._idAzienda) {
      this.loadData(null);
    }
  }
  @Input("refresh")
  set refresh(_refresh: any) {
    if (_refresh.name === "attivita-fatte") {
      this.loadData(null);
    }
  }
  @Output("onAttivitaNoteEmitter") private onAttivitaNoteEmitter: EventEmitter<AttivitaFatta> = new EventEmitter();

  public cols: any[] = [
    {
      // E' l'insieme di priorità e tipo attività
      field: "priorita",
      width: "37px",
      padding: 0,
      label: "priorità",
      minWidth: "37px"
    },
    {
      field: "idAzienda.nome",
      header: "Ente",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "100px",
      label: "ente",
      minWidth: "100px"
    },
    {
      field: "idApplicazione.nome",
      header: "App",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "93px",
      label: "applicazione",
      minWidth: "93px"
    },
    {
      field: "provenienza",
      header: "Da",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "140px",
      label: "provenienza",
      minWidth: "140px"
    },
    {
      field: "oggetto",
      header: "Oggetto",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      label: "oggetto",
      minWidth: "200px"
    },
    {
      field: "dataInserimentoRiga",
      header: "Svolta il",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      fieldType: "DateTime",
      filterWidget: "Calendar",
      ariaLabelDescription: "Colonna Data, Cella filtro",
      width: "128px",
      label: "svolta il",
      minWidth: "128px"
    },
    {
      field: "descrizione",
      header: "Tipo",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "120px",
      label: "tipo",
      minWidth: "120px"
    },
    {
    // colonna note
      width: "30px",
      label: "note",
      minWidth: "30px"
    },
  ];

  constructor(private datepipe: DatePipe, private attivitaFatteService: AttivitaFatteService, private loginService: NtJwtLoginService) { }

  ngOnInit() {
    this.subscriptions = [];
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      this.loggedUser = u;
    }));
    // this.loadData(null);
  }

  public loadData(event: LazyLoadEvent) {
    this.loading = true;
    const functionName = "loadData";

    // mi salvo il filtro dell'evento così, se cambio struttura o azienda posso ricaricare i dati applicando quel filtro
    // in alternativa potrei svuotare i filtri al cambio di struttura e azienda
    if (event) {
      this.previousEvent = event;
      this.lazyLoadFiltersAndSorts = buildLazyEventFiltersAndSorts(event, this.cols, this.datepipe);
    }
    this.initialFiltersAndSorts = this.buildInitialFiltersAndSorts(); // non so se è corretto metterlo qui o forse nel set strutturaSelezionata

    const pageConfing: PagingConf = this.buildPageConf(event);

    this.attivitaFatteService
      .getData(
        PROJECTIONS.attivitaFatta.customProjections
          .attivitaFattaWithIdApplicazioneAndIdAziendaAndTransientFields,
        this.initialFiltersAndSorts,
        this.lazyLoadFiltersAndSorts,
        pageConfing
      )
      .subscribe(data => {
        console.log("DATA FATTE", data);

        this.attivitaFatte = undefined;
        this.totalRecords = 0;
        if (data && data.results && data.page) {
          this.attivitaFatte = <AttivitaFatta[]>(
            data.results
          );

          this.totalRecords = data.page.totalElements;
          this.attivitaFatte.forEach(a => {
            if (a.tipo === "notifica") {
              a["iconaAttivita"] = "assets/images/baseline-notifications_none-24px.svg";
            } else if (!a.priorita || a.priorita === 3) {
              a["iconaAttivita"] = "assets/images/baseline-outlined_flag-24px.3.svg";
            } else if (a.priorita === 2) {
              a["iconaAttivita"] = "assets/images/baseline-outlined_flag-24px.2.svg";
            } else if (a.priorita === 1) {
              a["iconaAttivita"] = "assets/images/baseline-outlined_flag-24px.1.svg";
            }
          });
        }
        this.loading = false;
      });
  }

  // TODO: toglierla e usare quella in primeng-plugin dopo opportuno refactoring
  private buildPageConf(event: any): PagingConf {
    let page = 0;
    let size = this._rows;
    if (event) {
      page = event.first / event.rows;
      size = event.rows;
    }
    const pageConf: PagingConf = {
      conf: {
        page: page,
        size: size
      },
      mode: "PAGE"
    };
    return pageConf;
  }

  private buildInitialFiltersAndSorts(): FiltersAndSorts {
    const functionName = "buildInitialFiltersAndSorts";
    const initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addSort(new SortDefinition("id", SORT_MODES.desc));
    const filterIdPersona: FilterDefinition = new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.loggedUser.getUtente().fk_idPersona.id);
    initialFiltersAndSorts.addFilter(filterIdPersona);
    if (this._idAzienda !== -1) { // Il -1 equivale a mostrare per tutte le aziende, quindi se diverso da -1 filtro per azienda
      const filterIdAzienda: FilterDefinition = new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this._idAzienda);
      initialFiltersAndSorts.addFilter(filterIdAzienda);
    }
    // initialFiltersAndSorts.rows = 20;
    return initialFiltersAndSorts;
  }

  calendarTooltip(field: string) {
    let tooltip: string = "";
    if (this.dataRange && this.dataRange[field]) {
      if (this.dataRange[field][0]) {
        tooltip += this.datepipe.transform(this.dataRange[field][0], "dd/MM/yyyy");
      }
      if (this.dataRange[field][1]) {
        tooltip += " - " + this.datepipe.transform(this.dataRange[field][1], "dd/MM/yyyy");
      }
    }
    return tooltip;
  }

  public handleEvent(nome: string, event: any) {
    const functionName = "handleEvent";
    switch (nome) {
      case "onLazyLoad":
        this.lazyLoad(event);
        break;
      case "onRowSelect":
        // do nothing
        break;
    }
  }

  private lazyLoad(event: LazyLoadEvent) {
    const functionName = "lazyLoad";
    this.loadData(event);
  }

  public onKeydownHandlerArrowDown(event: Event) {
    // this.selectIndex(this.selectedRowIndex + 1);
  }

  public onKeydownHandlerArrowUp(event: Event) {
    // this.selectIndex(this.selectedRowIndex - 1);
  }

  public onNoteClick(attivita: any) {
    this.onAttivitaNoteEmitter.emit(attivita);
  }

  public onCalendarAction(event: any, field: string, action: string) {
    let calSel: Calendar = null;
    switch (action) {
      case "today":
        calSel = this._calGen.find(e => e.inputId === "CalInput_" + field);
        if (calSel) {
          calSel.overlayVisible = false;
        }
      break;

      case "clear":
        this.dataTable.filter(null, field, null);
      break;

      case "select":
        if (this._calGen) {
          calSel = this._calGen.find(a => a.inputId === "CalInput_" + field);
          if (calSel && this.dataRange && this.dataRange[field].length === 2
            && this.dataRange[field][0] && this.dataRange[field][1]) {
            calSel.overlayVisible = false;
          }
        }

        const value = this.dataRange[field];
        this.dataTable.filter(value, field, null);
      break;
    }
  }

  // public apriAttivita(attivita: any) {
  //   const attivitaJsonArray = JSON.parse(attivita.urls);
  //   if (attivitaJsonArray && attivitaJsonArray[0]) {
  //     /* abbiamo bisogno di un uuid diverso ad ogni entrata sull'ambiente,
  //        se no per un controllo anti-inde-sminchiamento onCommand ritorna e basta */
  //     window.open(attivitaJsonArray[0].url + encodeURIComponent("&richiesta=" + this.myRandomUUID()));
  //   }

  // }

  // /**************************
  // ** SuperSaloRollsTheUUID **
  // **************************/
  // private myRandomUUID() {
  //   // 8 - 4 - 4 - 4 - 16
  //   return this.fourRandomChar() + this.fourRandomChar() +                      // 8
  //      "-" + this.fourRandomChar() + "-" + this.fourRandomChar() + "-" +        // -4-4-4-
  //      this.fourRandomChar() + this.fourRandomChar() + this.fourRandomChar() ;  // 16
  // }

  // private fourRandomChar() {
  //   return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  // }

}

export class AttivitaFattaCustom extends AttivitaFatta {
  iconaAttivita: string;
}