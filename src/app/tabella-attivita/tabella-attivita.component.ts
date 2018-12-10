import { Component, OnInit, EventEmitter, Output, ViewChild, HostListener } from "@angular/core";
import { DatePipe } from "@angular/common";
import { LazyLoadEvent } from "primeng/api";
import { FILTER_TYPES, FiltersAndSorts, SortDefinition, SORT_MODES, LOCAL_IT, FilterDefinition, NO_LIMIT } from "@bds/nt-communicator";
import { buildLazyEventFiltersAndSorts } from "@bds/primeng-plugin";
import { AttivitaService } from "./attivita.service";
import { PROJECTIONS } from "../../environments/app-constants";
import { Attivita, Utente } from "@bds/ng-internauta-model";
import { NtJwtLoginService } from "@bds/nt-jwt-login";
import { Table } from "primeng/table";
@Component({
  selector: "app-tabella-attivita",
  templateUrl: "./tabella-attivita.component.html",
  styleUrls: ["./tabella-attivita.component.css"],
  providers: [DatePipe]
})
export class TabellaAttivitaComponent implements OnInit {
  /*
  attivita: any = [
    {priorita:'A', tipo: 'qq', azienda: '102', applicazione:'pico'},
    {priorita:'B', tipo: 'ww', azienda: '106', applicazione:'dete'},
    {priorita:'C', tipo: 'ee', azienda: '103', applicazione:'deli'},
  ]
  */
  public attivita: Attivita[];
  public totalRecords: number;
  public localIt = LOCAL_IT;

  public cols: any[];
  public dataRange: any = {};
  private previousEvent: LazyLoadEvent;
  private initialFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  private lazyLoadFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  public loggedUser: Utente;
  public loading: boolean = true; // lasciare questo a true se no da errore in console al primo caricamento delle attività
  public selectedRowIndex: number = -1;

  @Output("attivitaEmitter") private attivitaEmitter: EventEmitter<Attivita> = new EventEmitter();
  @Output("onAttivitaNoteEmitter") private onAttivitaNoteEmitter: EventEmitter<Attivita> = new EventEmitter();
  @ViewChild("dt") private dataTable: Table;

  constructor(private datepipe: DatePipe, private attivitaService: AttivitaService, private loginService: NtJwtLoginService) { }

  @HostListener("document:keydown.arrowdown", ["$event"]) onKeydownHandlerArrowDown(event: KeyboardEvent) {
    this.selectIndex(this.selectedRowIndex + 1);
  }

  @HostListener("document:keydown.arrowup", ["$event"]) onKeydownHandlerArrowUp(event: KeyboardEvent) {
    this.selectIndex(this.selectedRowIndex - 1);
  }

  ngOnInit() {

    // imposto l'utente loggato nell'apposita variabile
    this.loginService.loggedUser.subscribe((u: Utente) => {
      this.loggedUser = u;
    });

    this.cols = [
      /* {
        field: "priorita",
        header: "Priorita",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "tipo",
        header: "Tipo",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      }, */
      {
        // E' l'insieme di priorità e tipo attività
        width: "30px"
      },
      {
        field: "idAzienda.nome",
        header: "Ente",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        width: "85px"
      },
      {
        field: "idApplicazione.nome",
        header: "App",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        width: "80px"
      },
      {
        field: "provenienza",
        header: "Da",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        width: "140px"
      },
      {
        field: "oggetto",
        header: "Oggetto",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "dataInserimentoRiga",
        header: "Data",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "DateTime",
        filterWidget: "Calendar",
        ariaLabelDescription: "Colonna Inserimento, Cella filtro",
        width: "100px"
      },
      {
        field: "descrizione",
        header: "Tipo",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
        width: "120px"
      },
      {
        // colonna azione
        width: "60px"
      },
      {
        // colonna posso procedere
        width: "30px"
      },
      {
        // colonna trash
        width: "30px"
      },
      {
      // colonna note
        width: "30px"
      },
    ];
    this.loadData(null);
  }

  public attivitaEmitterHandler() {
    this.attivitaEmitter.emit(null);
  }

  ngAfterViewInit() {
    // aggiungo le label aria al campo input del calendario
    const colsDate = this.cols.filter(e => e.filterWidget === "Calendar");
    colsDate.forEach(element => {
      const calElm = document.getElementById("CalInput_" + element.field);
      calElm.setAttribute("aria-label", element.ariaLabelDescription);
    });
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
    // console.log(this.componentDescription, functionName, "nome:", nome, "event:", event);
    switch (nome) {
      case "onLazyLoad":
        this.lazyLoad(event);
        break;
      case "onRowSelect":
        this.rowSelect(event);
        break;
    }
  }

  private lazyLoad(event: LazyLoadEvent) {
    const functionName = "lazyLoad";
    // console.log(this.componentDescription, functionName, "event: ", event);

    this.loadData(event);
  }

  public selectIndex(index: number) {
    if (index < 0 || index >= this.attivita.length) { return; }

    this.selectedRowIndex = index;
    this.dataTable.selection = this.attivita[this.selectedRowIndex];
    this.attivitaEmitter.emit(this.dataTable.selection);
  }

  public rowSelect(event: any) {
    this.selectIndex(this.attivita.indexOf(event.data));
  }

  private buildInitialFiltersAndSorts(): FiltersAndSorts {
    const functionName = "buildInitialFiltersAndSorts";
    let initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addSort(new SortDefinition("dataInserimentoRiga", SORT_MODES.desc));
    const filter: FilterDefinition = new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.loggedUser.fk_idPersona.id);
    initialFiltersAndSorts.addFilter(filter);
    initialFiltersAndSorts.rows = NO_LIMIT;
    // console.log(this.componentDescription, functionName, "initialFiltersAndSorts:", initialFiltersAndSorts);
    return initialFiltersAndSorts;
  }


  private loadData(event: LazyLoadEvent) {
    this.loading = true;
    const functionName = "loadData";
    // console.log(this.componentDescription, functionName, "event: ", event);

    // mi salvo il filtro dell'evento così, se cambio struttura o azienda posso ricaricare i dati applicando quel filtro
    // in alternativa potrei svuotare i filtri al cambio di struttura e azienda
    if (event) {
      this.previousEvent = event;
      this.lazyLoadFiltersAndSorts = buildLazyEventFiltersAndSorts(event, this.cols, this.datepipe);
    }
    this.initialFiltersAndSorts = this.buildInitialFiltersAndSorts(); // non so se è corretto metterlo qui o forse nel set strutturaSelezionata

    this.attivitaService.getData(PROJECTIONS.attivita.standardProjections.AttivitaWithIdApplicazioneAndIdAzienda, this.initialFiltersAndSorts, this.lazyLoadFiltersAndSorts)
      .then(
        data => {
          this.attivita = undefined;
          this.totalRecords = 0;
          if (data && data._embedded && data.page) {
            this.attivita = <Attivita[]>data._embedded.attivita;
            this.totalRecords = data.page.totalElements;
            console.log("ATTIVITA: ", this.attivita);
            // console.log(this.componentDescription, functionName, "struttureUnificate: ", this.struttureUnificate);
            this.attivita.forEach(a => {console.log(a.tipo, a.priorita);
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
        }
      );

  }

  public apriAttivita(attivita: any) {
    const attivitaJsonArray = JSON.parse(attivita.urls);
    if (attivitaJsonArray && attivitaJsonArray[0]) {
      /* abbiamo bisogno di un uuid diverso ad ogni entrata sull'ambiente,
         se no per un controllo anti-inde-sminchiamento onCommand ritorna e basta */
      window.open(attivitaJsonArray[0].url + encodeURIComponent("&richiesta=" + this.myRandomUUID()));
    }

  }

  private onNoteClick(attivita: any) {
    this.onAttivitaNoteEmitter.emit(attivita);
  }


  /**************************
  ** SuperSaloRollsTheUUID **
  **************************/
  private myRandomUUID() {
    // 8 - 4 - 4 - 4 - 16
    return this.fourRandomChar() + this.fourRandomChar() +                      // 8
       "-" + this.fourRandomChar() + "-" + this.fourRandomChar() + "-" +        // -4-4-4-
       this.fourRandomChar() + this.fourRandomChar() + this.fourRandomChar() ;  // 16
  }

  private fourRandomChar() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

}
