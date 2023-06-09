import { Component, OnInit, EventEmitter, Output, ViewChild, AfterViewInit, OnDestroy, Input, ViewChildren, QueryList, Renderer2, ElementRef, Inject } from "@angular/core";
import { DatePipe } from "@angular/common";
import { LazyLoadEvent, MessageService, MenuItem, ConfirmationService } from "primeng/api";
import { buildLazyEventFiltersAndSorts } from "@bds/primeng-plugin";
import { AttivitaService } from "./attivita.service";
import { ColumnsNormal, ColumnsReordered } from "./viariables";
import { Attivita, ENTITIES_STRUCTURE, UrlsGenerationStrategy } from "@bds/internauta-model";
import { JWTModuleConfig, JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { Table } from "primeng/table";
import { Subscription } from "rxjs";
import { Calendar } from "primeng/calendar";
import * as Bowser from "bowser";
import { IntimusClientService, IntimusCommand, IntimusCommands, LOCAL_IT, RefreshAttivitaParams, UtilityFunctions } from "@bds/common-tools";
import { FiltersAndSorts, SortDefinition, FilterDefinition, PagingConf, FILTER_TYPES, SORT_MODES } from "@bds/next-sdr";
import { HttpClient } from "@angular/common/http";
import { ImpostazioniService } from "src/app/services/impostazioni.service";
import { ScrivaniaService } from "src/app/pagine/scrivania/scrivania.service";

@Component({
  selector: "app-attivita",
  templateUrl: "./attivita.component.html",
  styleUrls: ["./attivita.component.scss"],
  providers: [DatePipe]
})
export class TabellaAttivitaComponent implements OnInit, OnDestroy, AfterViewInit {

  private previousEvent: LazyLoadEvent;
  private initialFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  private lazyLoadFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  private subscriptions: Subscription[] = [];
  private listeners = new Map();
  private intimusSubscribbed = false;

  public LOADED_ROWS = 50;
  public attivita: Attivita[];
  public totalRecords: number;
  public localIt = LOCAL_IT;

  public cols = ColumnsNormal;
  public dataRange: any = {};
  public loggedUser: UtenteUtilities;
  public loading: boolean = true; // lasciare questo a true se no da errore in console al primo caricamento delle attività
  public selectedRowIndex: number = -1;
  public columnClass = "column-class-f";
  public attivitaSelezionata: Attivita;
  public contextMenuAperte: MenuItem[];
  public contextMenuNonAperte: MenuItem[];

  private _idAzienda: number = null;
  public showNote: boolean;
  public attivitaTemp: Attivita = new Attivita();
  public _noteTemp: string;

  public changedOrder: boolean;
  public hidePreview: boolean = false;

  private salvataggioNoteResultMessages = {
    success: {
      target: "clToast",
      message: "Note attività aggiornate con successo"
    },
    error: {
      target: "errorToast",
      message: "Errore nel salvataggio delle note attività."
    }
  };

  @Input("idAzienda")
  set idAzienda(idAzienda: number) {
    this._idAzienda = idAzienda;
    if (!this.loggedUser) { return; }
    if (this._idAzienda) {
      this.loadData(null);
    } else {
      this._idAzienda = -1;
    }
  }
  @Input("changeColOrder")
  set changeColOrder(changeColOrder: boolean) {
    this.changedOrder = changeColOrder;
    this.cols = !changeColOrder ? ColumnsNormal : ColumnsReordered;
  }

  @Input("refresh")
  set refresh(_refresh: any) {
    if (_refresh.name === "attivita") {
      this.loadData(null);
    }
  }

  @Output("attivitaEmitter") private attivitaEmitter: EventEmitter<Attivita> = new EventEmitter();
  @Output("onAttivitaNoteEmitter") private onAttivitaNoteEmitter: EventEmitter<Attivita> = new EventEmitter();
  @Output("refreshAttivita") private refreshAttivita: EventEmitter<string> = new EventEmitter();
  @ViewChild("dt") private dataTable: Table;
  @ViewChildren("calGen") private _calGen: QueryList<Calendar>;
  @ViewChildren("tableRows") tableRows: QueryList<ElementRef>;
  private selectedTableRowIndex: number;

  constructor(
    private datepipe: DatePipe,
    private attivitaService: AttivitaService,
    private loginService: JwtLoginService,
    private renderer: Renderer2,
    private messageService: MessageService,
    private intimusClientService: IntimusClientService,
    private confirmationService: ConfirmationService,
    private impostazioniService: ImpostazioniService,
    private scrivaniaService: ScrivaniaService,
    private httpClient: HttpClient
  ) {

    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      if (u) {
        // if (!this.loggedUser || u.getUtente().id !== this.loggedUser.getUtente().id) {
        //   this.loggedUser = u;
        //   console.log("faccio loadData");
        //   this.loadData(null);
        // } else {
        //   this.loggedUser = u;
        // }

        this.loggedUser = u;

        // tslint:disable-next-line:max-line-length
        // let a = (( (!!this.loggedUser.getUtente().utenteReale || this.loggedUser.isSD() ) && this.loggedUser.getUtente().aziende.length > 1) || (!!!this.loggedUser.getUtente().utenteReale && this.loggedUser.getUtente().aziendeAttive.length > 1) );

        if (!this.intimusSubscribbed) {
          this.subscriptions.push(this.intimusClientService.command$.subscribe((command: IntimusCommand) => {
            this.parseIntimusCommand(command);
          }));
          this.intimusSubscribbed = true;
        }
      }
      // console.log("faccio il load data di nuovo");
    }));
  }

  ngOnInit() {
    // imposto l'utente loggato nell'apposita variabile

    const that = this;
    window.addEventListener("resize", function(event) {
      const bodyTable = document.getElementsByClassName("ui-table-scrollable-body")[0] as HTMLElement;
      bodyTable.style.paddingBottom = "0.06rem";
      bodyTable.style.paddingBottom = "0.06rem";
    });
    this.contextMenuAperte = [
      { label: "Segna come da leggere", icon: "pi pi-eye-slash", command: (event) => this.handleContextMenu(this.attivitaSelezionata) }
    ];
    this.contextMenuNonAperte = [
      { label: "Segna come letta", icon: "pi pi-eye", command: (event) => this.handleContextMenu(this.attivitaSelezionata) }
    ];
    const browser = Bowser.getParser(window.navigator.userAgent);
    const browserInfo = browser.getBrowser();
    console.log("BROWSER = ", browserInfo);
    if (browserInfo.name !== "Firefox") {
      this.columnClass = "column-class-o";
    }

    this.verifyAndSetAnteprimaColumns();

    this.subscriptions.push(this.impostazioniService.settingsChangedNotifier$.subscribe(newSettings => {
      this.verifyAndSetAnteprimaColumns();

    }));

  }

  private verifyAndSetAnteprimaColumns() {
    this.hidePreview = this.impostazioniService.getHidePreview() === "true";
    console.log("Se hidePreview è true, 'anteprima' deve essere hidden = false;  se false, anteprima deve essere hidden = true ", this.hidePreview);

    //this.setVisibilityColumnAnteprima(!this.hidePreview);
    console.log("!! this.cols", this.cols);

  }

  /* private setVisibilityColumnAnteprima(hidden: boolean) {
    console.log("SETTO VISIBILITA COLONNA ANTEPRIMA", hidden);

    this.cols.forEach(element => {
      if (element.field === "anteprima") {
        element.visibility = hidden ? "collpse" : "visible";
        element.display = hidden ? "none" : "";
      }
    });
  } */

  private parseIntimusCommand(command: IntimusCommand) {
    // console.log("ricevuto comando in Attivita: ", command);
    if (command.command === IntimusCommands.RefreshAttivita) {
      const idAttivitaToRefresh = (command.params as RefreshAttivitaParams).id_attivita;
      const operation = (command.params as RefreshAttivitaParams).operation;
      // console.log(operation + " attivita " + idAttivitaToRefresh);
      const filterById: FiltersAndSorts = new FiltersAndSorts();
      filterById.addFilter(new FilterDefinition("id", FILTER_TYPES.not_string.equals, idAttivitaToRefresh));
      switch (operation) {
        case "INSERT":
          this.attivitaService.getData(ENTITIES_STRUCTURE.scrivania.attivita.customProjections.AttivitaWithIdApplicazioneAndIdAziendaAndTransientFields, filterById)
          .subscribe((data: any) => {
            if (data) {
              data = data.results[0];
              this.setAttivitaIcon(data);
              data.datiAggiuntivi = data.datiAggiuntivi;
              this.attivita.unshift(data);
            }
          });
        break;
        case "UPDATE":
          this.attivitaService.getData(ENTITIES_STRUCTURE.scrivania.attivita.customProjections.AttivitaWithIdApplicazioneAndIdAziendaAndTransientFields, filterById)
          .subscribe((data: any) => {
              if (data) {
                console.log("DATA", data);
                data = data.results[0];
                data.datiAggiuntivi = data.datiAggiuntivi;
                const idAttivitaToReplace = this.attivita.findIndex(attivita => attivita.id === idAttivitaToRefresh);
                if (idAttivitaToReplace >= 0) {
                  this.setAttivitaIcon(data);
                  this.attivita[idAttivitaToReplace] = data;
                  console.log("1 = ", this.attivita[idAttivitaToReplace].aperta);
                  this.attivitaEmitter.emit(data);
                  console.log("2 = ", this.attivita[idAttivitaToReplace].aperta);
                  this.dataTable.selection = this.attivita[this.selectedRowIndex];
                  console.log("3 = ", this.attivita[idAttivitaToReplace].aperta);
              }
            }
          });
        break;
        case "DELETE":
          const idAttivitaToDelete = this.attivita.findIndex(attivita => attivita.id === idAttivitaToRefresh);
          this.attivita.splice(idAttivitaToDelete, 1);
          this.attivitaEmitter.emit(null);
        break;
      }

      // this.loadData(this.previousEvent);
    }
  }

  doNotShowAziendaHeader( columns ) {
    let filteredColumns = columns;
    if (( (!!this.loggedUser.getUtente().utenteReale || this.loggedUser.isSD()) && this.loggedUser.getUtente().aziende.length < 2) ||
        (!!!this.loggedUser.getUtente().utenteReale && !this.loggedUser.isSD() && this.loggedUser.getUtente().aziendeAttive.length < 2)) {
      filteredColumns = columns.filter(obj => obj.field !== "idAzienda.nome");
    }
    return filteredColumns;
  }

  handleContextMenu(attivitaSelezionata: Attivita) {
    // this.messageService.add({ severity: "info", summary: "Car Selected", detail: attivitaSelezionata.oggetto });
    // attivitaSelezionata.aperta = !attivitaSelezionata.aperta;
    const attivitaToUpdate: Attivita = new Attivita();
    attivitaToUpdate.id = attivitaSelezionata.id;
    attivitaToUpdate.aperta = !attivitaSelezionata.aperta;
    attivitaToUpdate.version = attivitaSelezionata.version;
    this.attivitaService.patchHttpCall(attivitaToUpdate, attivitaToUpdate.id).subscribe( (attivitaAggiornata: Attivita) => {
      const indexAttivitaToReplace: number = this.attivita.findIndex(a => a.id === attivitaAggiornata.id);
      this.attivita[indexAttivitaToReplace].aperta = attivitaToUpdate.aperta;
      this.attivita[indexAttivitaToReplace].version = attivitaAggiornata.version;
    });
  }

  public attivitaEmitterHandler() {
    this.attivitaEmitter.emit(null);
  }

  ngAfterViewInit() {
    // aggiungo le label aria al campo input del calendario
    // this.loadData(null);
    const colsDate = this.cols.filter(e => e.filterWidget === "Calendar");
    colsDate.forEach(element => {
      const calElm = document.getElementById("CalInput_" + element.field);
      calElm.setAttribute("aria-label", element.ariaLabelDescription);
    });
  }

  public onKeydownHandlerArrowDown(event: Event) {
    console.log("Scattato down");
    this.selectIndex(this.selectedRowIndex + 1);
  }

  public onKeydownHandlerArrowUp(event: Event) {
    console.log("Scattato up");
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
    console.log(functionName, "event: ", event);
    this.loadData(event);
  }

  public selectIndex(index: number) {
    console.log("Index of the row: ", index, "Table Index, selectexRowIndex: ", this.selectedRowIndex);
    this.selectedTableRowIndex = index;
    if (index < 0 || index >= this.attivita.length) { return; }
    console.log("Controllo supertao: ", this.attivita[index]);
    this.selectedRowIndex = index;
    this.dataTable.selection = this.attivita[this.selectedRowIndex];
    const attivitaSelezionata: Attivita = this.attivita[this.selectedRowIndex];
    if (!attivitaSelezionata.aperta) { // se l'attivita non è letta la metto come letta
      attivitaSelezionata.aperta = !attivitaSelezionata.aperta;
      this.attivitaService.update(attivitaSelezionata).subscribe( (a: Attivita) => {
          this.attivita[this.selectedRowIndex].version = a.version;
          attivitaSelezionata.version = a.version;
        }
      );
    }
    this.attivitaEmitter.emit(this.dataTable.selection);
  }

  public rowSelect(event: any) {
    this.selectIndex(this.attivita.indexOf(event.data));
  }

  private buildInitialFiltersAndSorts(): FiltersAndSorts {
    const initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addSort(new SortDefinition("data", SORT_MODES.desc));
    initialFiltersAndSorts.addSort(new SortDefinition("id", SORT_MODES.desc));
    const filterIdPersona: FilterDefinition = new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.loggedUser.getUtente().fk_idPersona.id);
    initialFiltersAndSorts.addFilter(filterIdPersona);
    if (this._idAzienda !== -1) { // Il -1 equivale a mostrare per tutte le aziende, quindi se diverso da -1 filtro per azienda
      const filterIdAzienda: FilterDefinition = new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this._idAzienda);
      initialFiltersAndSorts.addFilter(filterIdAzienda);
    }
    // initialFiltersAndSorts.rows = this.LOADED_ROWS;
    // console.log(this.componentDescription, functionName, "initialFiltersAndSorts:", initialFiltersAndSorts);
    return initialFiltersAndSorts;
  }

  // TODO: toglierla e usare quella in primeng-plugin dopo opportuno refactoring
  private buildPageConf(event): PagingConf {
    let page = 0;
    let size = this.LOADED_ROWS;
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

  private loadData(event: LazyLoadEvent) {
    /* console.log("TOKEN: ", this.loginService.token);
    console.log("UTENTE: ", this.loggedUser); */
    this.loading = true;
    const functionName = "loadData";
    console.log("Ricerca su colonna");

    // mi salvo il filtro dell'evento così, se cambio struttura o azienda posso ricaricare i dati applicando quel filtro
    // in alternativa potrei svuotare i filtri al cambio di struttura e azienda
    if (event) {
      this.previousEvent = event;
      this.lazyLoadFiltersAndSorts = buildLazyEventFiltersAndSorts(event, this.cols, this.datepipe);
    }
    this.initialFiltersAndSorts = this.buildInitialFiltersAndSorts(); // non so se è corretto metterlo qui o forse nel set strutturaSelezionata

    const pageConfing: PagingConf = this.buildPageConf(event);

    this.attivitaService.getData(ENTITIES_STRUCTURE.scrivania.attivita.customProjections.AttivitaWithIdApplicazioneAndIdAziendaAndTransientFields,
        this.initialFiltersAndSorts,
        this.lazyLoadFiltersAndSorts,
        pageConfing).subscribe(data => {
        this.attivita = undefined;
        this.totalRecords = 0;
        if (data && data.results && data.page) {
          this.attivita = <Attivita[]>data.results;
          this.totalRecords = data.page.totalElements;
          /* console.log("ATTIVITA: ", this.attivita); */
          // console.log(this.componentDescription, functionName, "struttureUnificate: ", this.struttureUnificate);
          this.attivita.forEach((attivita: Attivita) => {
            this.setAttivitaIcon(attivita);
            // console.log("carica", a.datiAggiuntivi);
            //a.datiAggiuntivi = JSON.parse(a.datiAggiuntivi); // l'ho messa qua e tolta da dentro setAttivitaIcon perché andava in errore (l.s.)
            // "forbidden" è un caso di smicnhiamento probabilmente
            if (attivita.descrizione !== "Redazione" && attivita.descrizione !== "Bozza" && attivita.allegati && attivita.allegati !== null) {
              // const jsonObject = JSON.parse(a.allegati);
              const allegati = attivita.allegati;
              for (let i = 0; i < allegati.length; i++) {
                if (allegati[i].tipologia === "STAMPA_UNICA") {
                  attivita["allegatoDaMostrare"] = allegati[i];
                }
              }
            } else if (attivita.allegati && attivita.allegati !== null && (attivita.descrizione === "Redazione" || attivita.descrizione === "Bozza")) {
              attivita["anteprimaNonDisponibile"] = "Non disponibile";
            }
          });
        }
        this.loading = false;
      });

  }

  private setAttivitaIcon(a: Attivita) {
    // a.datiAggiuntivi = JSON.parse(a.datiAggiuntivi);  // ?? perché questa stava qua? boh, comunque dava errore al click (l.s.)
    if (a.tipo === "notifica") {
      a["iconaAttivita"] = "assets/images/baseline-notifications_none-24px.svg";
    } else if (!a.priorita || a.priorita === 3) {
      a["iconaAttivita"] = "assets/images/baseline-outlined_flag-24px.3.svg";
    } else if (a.priorita === 2) {
      a["iconaAttivita"] = "assets/images/baseline-outlined_flag-24px.2.svg";
    } else if (a.priorita === 1) {
      a["iconaAttivita"] = "assets/images/baseline-outlined_flag-24px.1.svg";
    }
  }

  public apriAttivita(attivita: Attivita) {
    const compiledUrlsJsonArray = JSON.parse(attivita.compiledUrls);
    this.selectIndex(this.attivita.indexOf(attivita));
    if (compiledUrlsJsonArray && compiledUrlsJsonArray[0]) {
      const encodeParams = attivita.idApplicazione.urlGenerationStrategy === UrlsGenerationStrategy.TRUSTED_URL_WITH_CONTEXT_INFORMATION ||
                          attivita.idApplicazione.urlGenerationStrategy === UrlsGenerationStrategy.TRUSTED_URL_WITHOUT_CONTEXT_INFORMATION;
      const addRichiestaParam = true;
      const addPassToken = true;
      this.loginService.buildInterAppUrl(compiledUrlsJsonArray[0].url, encodeParams, addRichiestaParam, addPassToken, true).subscribe((url: string) => {
        console.log("urlAperto:", url);
      });
    }

  }

  public deleteAttivita(event: MouseEvent, attivita: Attivita) {
    event.stopPropagation();
    const response = this.attivitaService.delete(attivita);
    this.loading = true;
    response.subscribe(res => {
      this.refreshAttivitaCaller();
      this.messageService.add({ severity: "info", summary: "Eliminazione", detail: "Notifica eliminata con successo!" });
    }, err => {
      this.messageService.add({ severity: "error", summary: "Eliminazione", detail: "Non è stato possibile eliminare la notifica. Contattare BabelCare" });
      console.error("Messaggio errore: ", err);
    });
  }

  getColumnValue(attivita, col, td?, link?) {
    let res = "";
    // console.log("inside getColumnValue");
    if (attivita && col.field) {
      switch (col.field) {
        case "idAzienda.nome":
        case "idApplicazione.nome":
          res = attivita[col.field.split(".")[0]][col.field.split(".")[1]];
          if (res === "Servizio di download"){
            res = "Gedi"
          }
          break;

        case "data":
          res = this.datepipe.transform(attivita[col.field], "dd/MM/yyy");
          break;

        case "provenienza":
          if (td && !td.classList.contains(this.columnClass)) {
            this.renderer.addClass(td, this.columnClass);
            td.innerHTML = attivita[col.field];
            res = undefined;
          } else {
            res = attivita[col.field];
          }
          break;

        case "azione":
          if (td.classList.contains(this.columnClass)) {
            this.renderer.removeClass(td, this.columnClass);
          }
          // console.log("getColumnValue td", td);
          this.fillActionCol(attivita, td);
          res = undefined;
          break;
        default:
          if (td && !td.classList.contains(this.columnClass)) {
            this.renderer.addClass(td, this.columnClass);
          }
          res = attivita[col.field];
          break;
      }
    }
    return res;
  }

  fillActionCol(attivita, td) {
    if (attivita.tipo === "attivita" || (attivita.tipo === "notifica" && ["procton", "dete", "deli", "downloader"].includes(attivita.idApplicazione.id))) {
      if (attivita.idApplicazione.id === "downloader"){
        td.innerHTML = `<a style="color: #993366; cursor:pointer;" aria-hidden="true"><strong>Scarica</strong></a>`;
      }else{
        td.innerHTML = `<a style="color: #993366; cursor:pointer;" aria-hidden="true"><strong>Apri</strong></a>`;
      }
      if (this.listeners[td.id]) {
        this.listeners[td.id][0](); // Rimuovo il listener agganciato al td chiamando la funzione associata
        this.listeners.delete(td.id); // Lo elimino anche dall'array per riaggiungerlo sia nella nuova colonna che nella stessa
      }
      this.listeners[td.id] = [this.renderer.listen(td, "mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("fillActionCol td", td);
        if (!td.classList.contains("disabled")) {
          this.apriAttivita(attivita);

          this.renderer.addClass(td, "disabled");
          // this.renderer.setAttribute(td, "title", "disabilitato per un paio di secondi");

          setTimeout(() => {
            this.renderer.removeClass(td, "disabled");
            // this.renderer.removeAttribute(td, "title");
          }, 5000);
        }

      }), td.cellIndex];

    } else {
      td.innerHTML = "";
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

  public onNoteClick(attivita: any) {
    this.onAttivitaNoteEmitter.emit(attivita);

  }

  public noteClicckato(attivita: Attivita, event: any) {
    event.stopPropagation();
    if (attivita) {
      this.showNote = true;
      this.attivitaTemp = attivita;
      this._noteTemp = attivita.note;
    }
  }

  public onClickSuApriAnteprima(attivita: Attivita, event: any) {
    event.stopPropagation();
    if (attivita["allegatoDaMostrare"]) {
      this.apriAnteprima(attivita);
    } else {
      console.log("NESSUNA STAMPA UNICA DA MOSTRARE");
    }
  }

  public apriAnteprima(attivita: Attivita) {
    console.log("apriAnteprima(attivita: Attivita)", attivita);
    if (attivita["allegatoDaMostrare"]) {
      this.scrivaniaService.getAnteprima(attivita, attivita["allegatoDaMostrare"])
        .subscribe(
          file => {
            const name = attivita.oggetto.substr(0, attivita.oggetto.indexOf(":"));
            /* console.log(attivita);
            console.log("FILE", file);
            console.log(typeof file);
            console.log(name); */
            let newWindow: Window;
            if (typeof file === "string") {
              newWindow = window.open(file, "_balank");
            } else  {
              newWindow = window.open(file["url"], "_balank");
            }
            newWindow.document.title = name;  // BOH! Vorrei capire come fare
            newWindow.focus();
            console.log("IL DOCUMENT", newWindow.document);
          },
          err => {
            console.log("ERRORE!!!", err);
            this.messageService.clear("errorToast");
            this.messageService.add({ key: "errorToast",
              severity: "error", summary: "Attenzione",
              detail: "Stampa Unica non trovata" });
          }
        );
    } else {
      console.log("NESSUNA STAMPA UNICA DA MOSTRARE");
    }
  }

  closeAndBasta() {
    this.showNote = false;
    setTimeout(() => { // this will make the execution after the above boolean has changed
      const selectedRow = this.tableRows.toArray()[0];
      selectedRow.nativeElement.focus();
    }, 0);
  }

  // bottoneSalvaNote() {
  //   this.showNote = true;
  //   if (this._noteTemp !== this.attivitaTemp.note) {
  //     this.chiediConfermaAndFaiCose("saveNotes",
  //       "Vuoi salvare le modifiche apportate alle note dell'attività?",
  //       () => { this.salvaNote(); }, // conferma: salvo
  //       () => { this.showNote = true; return; }// non confermo: non faccio nulla
  //     );
  //   } else {
  //     this.closeAndBasta();
  //   }
  // }

  bottoneSalvaNote() {
    this.showNote = true;
    if (this._noteTemp !== this.attivitaTemp.note) {
      this.salvaNote();
    } else {
      this.closeAndBasta();
    }
  }

  salvaNote() {
    this.attivitaService.update(this.attivitaTemp).subscribe(
      res => {
        this.messageService.clear("clToast");
        this.messageService.add({key: this.salvataggioNoteResultMessages.success.target, severity: "success", summary: "OK", detail: this.salvataggioNoteResultMessages.success.message});
        this.closeAndBasta();
      },
      err => {
        this.messageService.clear("errorToast");
        this.messageService.add({ key: this.salvataggioNoteResultMessages.error.target, severity: "error", summary: "Errore", detail: this.salvataggioNoteResultMessages.error.message });
      }
    );
  }

  // chiudiNote() {
  //   if (this._noteTemp !== this.attivitaTemp.note) {
  //     // domando se vuole davvero uscire senza salvare
  //     this.chiediConfermaAndFaiCose("closeWithoutSaving",
  //       "La finestra verrà chiusa senza salvare le modifiche: continuare?",
  //       () => { // funzione di accept: reimposto il valore iniziale
  //         this.attivitaTemp.note = this._noteTemp;
  //         this.closeAndBasta();
  //       },
  //       () => { // funzione reject: ritorno senza uscire
  //         this.showNote = true;
  //         return;
  //       }
  //     );
  //   } else {
  //     // esco senza salvare tanto non ci sono cambiamenti.
  //     this.attivitaTemp.note = this._noteTemp; // reimposto il valore iniziale
  //     this.closeAndBasta();
  //   }
  // }

  chiudiNote() {
    if (this._noteTemp !== this.attivitaTemp.note) {
      // domando se vuole davvero uscire senza salvare
      this.attivitaTemp.note = this._noteTemp;
      this.closeAndBasta();
    } else {
      // esco senza salvare tanto non ci sono cambiamenti.
      this.attivitaTemp.note = this._noteTemp; // reimposto il valore iniziale
      this.closeAndBasta();
    }
  }

  impostaPriorita(attivita: Attivita, event: any) {
    if (attivita.tipo === "attivita") {
      (!attivita.priorita || attivita.priorita === 3 ? attivita.priorita = 1 : (attivita.priorita === 1 ? attivita.priorita = 2 : attivita.priorita = 3));
      this.setAttivitaIcon(attivita);
      this.attivitaService.update(attivita).subscribe();
      event.stopPropagation();
    }
  }

  chiediConfermaAndFaiCose(_key: string, _message: string, _accept: any, _reject: any) {
    this.confirmationService.confirm({
      key: _key,
      message: _message,
      accept: () => {_accept(); },
      reject: () => {_reject(); }
    });
  }

  refreshAttivitaCaller(): void {
    console.log('scatta evento');
    this.refreshAttivita.next('refresh');
  }

  public confermaEliminaAttivita(attivita: Attivita, event: Event): void {
    this.confirmationService.confirm({
      key: "confirm-popup",
      target: event.target,
      message: "Stai eliminando questa attività, vuoi proseguire?",
      accept: () => {
        this.loading= true;
        this.attivitaService.eliminaAttivitaDemiurgo(attivita).subscribe(
          res => {
            this.refreshAttivitaCaller();
            this.messageService.add({
              severity: "success",
              key : "attivitaToast",
              summary: "OK",
              detail: `Attività rimossa dalla scrivania con successo! `
            });
            this.loading = false;
            console.log(res);
          },
          err => {
            this.messageService.add({
              severity: "warn",
              key : "attivitaToast",
              summary: "Attenzione",
              detail: `Si è verificato un errore nell'eliminazione dell'attività, contattare il servizio di supporto`
            });
          }
        );
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
    this.intimusSubscribbed = false;
  }
}
