import { Component, OnInit, EventEmitter, Output, ViewChild, AfterViewInit, OnDestroy, Input, ViewChildren, QueryList, Renderer2 } from "@angular/core";
import { DatePipe } from "@angular/common";
import { LazyLoadEvent, MessageService, MenuItem } from "primeng/api";
import { FILTER_TYPES, FiltersAndSorts, SortDefinition, SORT_MODES, LOCAL_IT, FilterDefinition } from "@bds/nt-communicator";
import { buildLazyEventFiltersAndSorts } from "@bds/primeng-plugin";
import { AttivitaService } from "./attivita.service";
import { PROJECTIONS } from "../../../environments/app-constants";
import { ColumnsNormal, ColumnsReordered } from "./viariables";
import { Attivita, Utente } from "@bds/ng-internauta-model";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Table } from "primeng/table";
import { Subscription } from "rxjs";
import { Calendar } from "primeng/calendar";
import * as Bowser from "bowser";
import { IntimusClientService } from "src/app/intimus/intimus-client.service";
import { IntimusCommand, IntimusCommands } from "src/app/intimus/intimus-command";

@Component({
  selector: "app-attivita",
  templateUrl: "./attivita.component.html",
  styleUrls: ["./attivita.component.css"],
  providers: [DatePipe]
})
export class TabellaAttivitaComponent implements OnInit, OnDestroy, AfterViewInit {

  private previousEvent: LazyLoadEvent;
  private initialFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  private lazyLoadFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  private subscriptions: Subscription[] = [];
  private listeners = new Map();


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
  @ViewChild("dt") private dataTable: Table;
  @ViewChildren("calGen") private _calGen: QueryList<Calendar>;

  constructor(
    private datepipe: DatePipe,
    private attivitaService: AttivitaService,
    private loginService: NtJwtLoginService,
    private renderer: Renderer2,
    private messageService: MessageService,
    private intimusClientService: IntimusClientService
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
        this.subscriptions.push(this.intimusClientService.command$.subscribe((command: IntimusCommand) => {
          this.parseIntimusCommand(command);
        }));
      }
      // console.log("faccio il load data di nuovo");
    }));
   }

  ngOnInit() {
    // imposto l'utente loggato nell'apposita variabile

    const that = this;
    window.addEventListener("resize", function(event) {
      const bodyTable = document.getElementsByClassName("ui-table-scrollable-body")[0] as HTMLElement;
      bodyTable.style.paddingBottom = "1px";
      bodyTable.style.paddingBottom = "1px";
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
  }

  private parseIntimusCommand(command: IntimusCommand) {
    // console.log("ricevuto comando in Attivita: ", command);
    if (command.command === IntimusCommands.RefreshAttivita) {
      const idAttivitaToRefresh = command.params.id_attivita;
      const operation = command.params.operation;
      // console.log(operation + " attivita " + idAttivitaToRefresh);
      switch (operation) {
        case "INSERT":
          this.attivitaService.getData(PROJECTIONS.attivita.customProjections.attivitaWithIdApplicazioneAndIdAziendaAndTransientFields, null, null, idAttivitaToRefresh)
          .then((data: Attivita) => {
            if (data) {
              this.setAttivitaIcon(data);
              this.attivita.unshift(data);
            }
          });
        break;
        case "UPDATE":
          this.attivitaService.getData(PROJECTIONS.attivita.customProjections.attivitaWithIdApplicazioneAndIdAziendaAndTransientFields, null, null, idAttivitaToRefresh)
          .then((data: Attivita) => {
              if (data) {
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



  handleContextMenu(attivitaSelezionata: Attivita) {
    // this.messageService.add({ severity: "info", summary: "Car Selected", detail: attivitaSelezionata.oggetto });
    attivitaSelezionata.aperta = !attivitaSelezionata.aperta;
    this.attivitaService.update(attivitaSelezionata);
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

  public onKeydownHandlerArrowDown(event: KeyboardEvent) {
    console.log("Scattato down");
    this.selectIndex(this.selectedRowIndex + 1);
  }

  public onKeydownHandlerArrowUp(event: KeyboardEvent) {
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
    // console.log(functionName, "event: ", event);
    this.loadData(event);
  }

  public selectIndex(index: number) {
    console.log("Index: ", index, "Table Index: ", this.selectedRowIndex);

    if (index < 0 || index >= this.attivita.length) { return; }
    console.log("Controllo supertao: ", this.attivita[index]);
    this.selectedRowIndex = index;
    this.dataTable.selection = this.attivita[this.selectedRowIndex];
    const attivitaSelezionata: Attivita = this.attivita[this.selectedRowIndex];
    if (!attivitaSelezionata.aperta) { // se l'attivita non è letta la metto come letta
      attivitaSelezionata.aperta = !attivitaSelezionata.aperta;
      this.attivitaService.update(attivitaSelezionata);
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
    initialFiltersAndSorts.rows = this.LOADED_ROWS;
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
            this.attivita.forEach(a => {
              this.setAttivitaIcon(a);
            });
          }
          this.loading = false;
        }
      );

  }

  private setAttivitaIcon(a: Attivita) {
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
  }

  public apriAttivita(attivita: Attivita) {
    const compiledUrlsJsonArray = JSON.parse(attivita.compiledUrls);
    this.selectIndex(this.attivita.indexOf(attivita));
    if (compiledUrlsJsonArray && compiledUrlsJsonArray[0]) {
      /* abbiamo bisogno di un uuid diverso ad ogni entrata sull'ambiente,
         se no per un controllo anti-inde-sminchiamento onCommand ritorna e basta */
      window.open(compiledUrlsJsonArray[0].url + encodeURIComponent("&richiesta=" + this.myRandomUUID()));
    }

  }

  public deleteAttivita(event: MouseEvent, attivita: Attivita) {
    event.stopPropagation();
    const response = this.attivitaService.delete(attivita);
    response.then(res => {
      const index = this.attivita.findIndex(element => element === attivita);
      this.attivita.splice(index, 1);
      this.messageService.add({ severity: "info", summary: "Eliminazione", detail: "Notifica eliminata con successo!" });
    }).catch(err => {
      this.messageService.add({ severity: "error", summary: "Eliminazione", detail: "Non è stato possibile eliminare la notifica. Contattare BabelCare" });
      console.error("Messaggio errore: ", err);
    });
  }

  getColumnValue(attivita, col, td?) {
    let res = "";
    if (attivita && col.field) {
      switch (col.field) {
        case "idAzienda.nome":
        case "idApplicazione.nome":
          res = attivita[col.field.split(".")[0]][col.field.split(".")[1]];
          break;

        case "data":
          res = this.datepipe.transform(attivita[col.field], "dd/MM/yyy");
          break;

        case "provenienza":
          if (td && !td.classList.contains(this.columnClass)) {
            this.renderer.addClass(td, this.columnClass);
            td.innerHTML = attivita[col.field];
            return;
          } else {
            res = attivita[col.field];
          }
          break;

        case "azione":
          if (td.classList.contains(this.columnClass)) {
            this.renderer.removeClass(td, this.columnClass);
          }
          this.fillActionCol(attivita, td);
          return;

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
    if (attivita.tipo === "attivita" || (attivita.tipo === "notifica" &&
      (attivita.idApplicazione.nome === "Pico" || attivita.idApplicazione.nome === "Dete" || attivita.idApplicazione.nome === "Deli"))) {
      td.innerHTML = `<a style="color: #993366; cursor: pointer"><strong>Apri</strong></a>`;
      if (this.listeners[td.id]) {
        this.listeners[td.id][0](); // Rimuovo il listener agganciato al td chiamando la funzione associata
        this.listeners.delete(td.id); // Lo elimino anche dall'array per riaggiungerlo sia nella nuova colonna che nella stessa
      }
      this.listeners[td.id] = [this.renderer.listen(td, "click", () => {
        this.apriAttivita(attivita);
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
}
