import { Component, OnInit, EventEmitter, Output, ViewChild, HostListener, AfterViewInit, OnDestroy, Input, ViewChildren, QueryList } from "@angular/core";
import { DatePipe } from "@angular/common";
import { LazyLoadEvent } from "primeng/api";
import { FILTER_TYPES, FiltersAndSorts, SortDefinition, SORT_MODES, LOCAL_IT, FilterDefinition, NO_LIMIT } from "@bds/nt-communicator";
import { buildLazyEventFiltersAndSorts } from "@bds/primeng-plugin";
import { AttivitaService } from "./attivita.service";
import { PROJECTIONS } from "../../../environments/app-constants";
import { Attivita, Utente } from "@bds/ng-internauta-model";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Table } from "primeng/table";
import { Subscription } from "rxjs";
import { Calendar } from "primeng/calendar";
@Component({
  selector: "app-attivita",
  templateUrl: "./attivita.component.html",
  styleUrls: ["./attivita.component.css"],
  providers: [DatePipe]
})
export class TabellaAttivitaComponent implements OnInit, OnDestroy, AfterViewInit {
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
  public loggedUser: UtenteUtilities;
  public loading: boolean = true; // lasciare questo a true se no da errore in console al primo caricamento delle attività
  public selectedRowIndex: number = -1;
  private subscriptions: Subscription[] = [];

  private _idAzienda: number = -1;
  @Input("idAzienda")
  set idAzienda(idAzienda: number) {
    this._idAzienda = idAzienda;
    if ( !this.loggedUser ) { return; }
    this.loadData(null);
  }

  @Output("attivitaEmitter") private attivitaEmitter: EventEmitter<Attivita> = new EventEmitter();
  @Output("onAttivitaNoteEmitter") private onAttivitaNoteEmitter: EventEmitter<Attivita> = new EventEmitter();
  @ViewChild("dt") private dataTable: Table;
  @ViewChildren("calGen") private _calGen: QueryList<Calendar>;

  constructor(private datepipe: DatePipe, private attivitaService: AttivitaService, private loginService: NtJwtLoginService) { }

  ngOnInit() {
      // imposto l'utente loggato nell'apposita variabile
      console.log("attivita onInit()");
      this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
        if (u) {
          this.loggedUser = u;
          /* console.log("faccio loadData"); */
          this.loadData(null);
        }
        // console.log("faccio il load data di nuovo");
      }));

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
      },
    ];
    const that = this;
    window.addEventListener("resize", function(event) {
      const bodyTable = document.getElementsByClassName("ui-table-scrollable-body")[0] as HTMLElement;
      bodyTable.style.paddingBottom = "1px";
      bodyTable.style.paddingBottom = "1px";
    });
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

  public onKeydownHandlerArrowDown(event: KeyboardEvent) {
    this.selectIndex(this.selectedRowIndex + 1);
  }

  public onKeydownHandlerArrowUp(event: KeyboardEvent) {
    this.selectIndex(this.selectedRowIndex - 1);
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
        const attivitaSelezionata: Attivita = event.data;
        attivitaSelezionata.aperta = true;
        this.attivitaService.update(attivitaSelezionata);
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
    const attivitaSelezionata: Attivita = this.attivita[this.selectedRowIndex];
    attivitaSelezionata.aperta = true;
    this.attivitaService.update(attivitaSelezionata);
    this.attivitaEmitter.emit(this.dataTable.selection);
  }

  public rowSelect(event: any) {
    this.selectIndex(this.attivita.indexOf(event.data));
  }

  private buildInitialFiltersAndSorts(): FiltersAndSorts {
    const functionName = "buildInitialFiltersAndSorts";
    const initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addSort(new SortDefinition("data", SORT_MODES.desc));
    const filterIdPersona: FilterDefinition = new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.loggedUser.getUtente().fk_idPersona.id);
    initialFiltersAndSorts.addFilter(filterIdPersona);
    if (this._idAzienda !== -1) { // Il -1 equivale a mostrare per tutte le aziende, quindi se diverso da -1 filtro per azienda
      const filterIdAzienda: FilterDefinition = new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this._idAzienda);
      initialFiltersAndSorts.addFilter(filterIdAzienda);
    }
    initialFiltersAndSorts.rows = NO_LIMIT;
    // console.log(this.componentDescription, functionName, "initialFiltersAndSorts:", initialFiltersAndSorts);
    return initialFiltersAndSorts;
  }


  private loadData(event: LazyLoadEvent) {
    /* console.log("TOKEN: ", this.loginService.token);
    console.log("UTENTE: ", this.loggedUser); */
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

    this.attivitaService.getData(PROJECTIONS.attivita.customProjections.attivitaWithIdApplicazioneAndIdAziendaAndTransientFields, this.initialFiltersAndSorts, this.lazyLoadFiltersAndSorts)
      .then(
        data => {

          this.attivita = undefined;
          this.totalRecords = 0;
          if (data && data._embedded && data.page) {
            this.attivita = <Attivita[]>data._embedded.attivita;
            this.totalRecords = data.page.totalElements;
            /* console.log("ATTIVITA: ", this.attivita); */
            // console.log(this.componentDescription, functionName, "struttureUnificate: ", this.struttureUnificate);
            this.attivita.forEach(a => {console.log(a.tipo, a.priorita);
              a.datiAggiuntivi = JSON.parse(a.datiAggiuntivi);

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

  public apriAttivita(attivita: Attivita) {
    const compiledUrlsJsonArray = JSON.parse(attivita.compiledUrls);
    if (compiledUrlsJsonArray && compiledUrlsJsonArray[0]) {
      /* abbiamo bisogno di un uuid diverso ad ogni entrata sull'ambiente,
         se no per un controllo anti-inde-sminchiamento onCommand ritorna e basta */
      window.open(compiledUrlsJsonArray[0].url + encodeURIComponent("&richiesta=" + this.myRandomUUID()));
    }

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

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }

  prova(row) {
    console.log(row);
    console.log(typeof row);
  }
}
