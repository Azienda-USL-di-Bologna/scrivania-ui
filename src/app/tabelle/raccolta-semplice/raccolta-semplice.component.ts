import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, Inject, Input, OnInit, QueryList, ViewChild,  ViewChildren } from '@angular/core';
import { Azienda } from '@bds/ng-internauta-model';
import { LOCAL_IT } from '@bds/nt-communicator';
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';
import { FILTER_TYPES } from '@nfa/next-sdr';
import { Subscription } from 'rxjs/internal/Subscription';
import { RaccoltaSempliceService } from './raccolta-semplice.service';
import { Document } from './documento.model';
import { Table } from 'primeng-lts/table';
import { CsvExtractor } from '@bds/primeng-plugin';
import { Calendar } from 'primeng-lts/calendar';
import { FilterUtils } from "primeng-lts/utils";
import { Storico } from './dettaglio-annullamento/modal/storico';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { getSupportedInputTypes } from '@angular/cdk/platform';
import { LazyLoadEvent } from 'primeng-lts/api';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { eventNames } from 'process';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-raccolta-semplice',
  templateUrl: './raccolta-semplice.component.html',
  styleUrls: ['./raccolta-semplice.component.css']
})
export class RaccoltaSempliceComponent implements OnInit {
  constructor(private raccoltaSempliceService: RaccoltaSempliceService, private loginService: NtJwtLoginService, private datePipe: DatePipe, private formBuilder: FormBuilder) { }

  _azienda: Azienda;
  @Input() set azienda(aziendaValue: Azienda) {
    if (aziendaValue) {
      this._azienda = aziendaValue;
    }
  }

  public validateForm: FormGroup = this.formBuilder.group({
    'stato': new FormControl('', Validators.required),
    'motivazione' : new FormControl('', Validators.required)
  });

  public contentTypesEnabledForPreview = ["text/html", "application/pdf", "text/plain", "image/jpeg", "image/png"];
  public filters: any;
  public selectedButton: string;
  public lastStato: boolean;
  public storici: Storico[] = [];  
  public display = false;
  public mostra = false;
  public dataRange: Date[] = [];
  public datiDocumenti: Document[] = [];
  public loading: boolean = false;
  public _rows = 20;
  public subscriptions: Subscription[]=[];
  public loggedUser: UtenteUtilities;
  public exportCsvInProgress: boolean = false;
  public totalRecords: number = this.datiDocumenti.length;
  public it = LOCAL_IT;
  public dataOggi: Date = new Date();
  public dataInizio: Date = null;
  public dataFine: Date = new Date(this.dataOggi.toDateString());
  public idRaccoltaTemp: string;
  public radioStato: string;
  public testoMotivazione: string;
  public filtri: string[] = [];
  public filtriRicerca: string[] = [];
  public untouched: boolean;
  public newDate: string;
  public datiPaginati: Document[] = [];

  public recordPerPagina:number = 1;

  @ViewChild("tableRaccoltaSemplice") private dataTable: Table;
  @ViewChildren("calGenz") public _calGen: QueryList<Calendar>;
   


  public colsDetail: any[] = [
    {
      field: "nome"
    }
  ]



  public cols: any[] = [
    {
      field: "codice",
      header: "Numero",
      width: "100px",
      label: "Numero Raccolta Semplice",
      textAlign: "center",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
    },
    {
      field: "createTime",
      header: "Registrazione",
      width: "122px",
      filterMatchMode: '',
      label: "Data registrazione",
      filterWidget: "Calendar",
      fieldType: "'DateTime'",
      textAlign:"center"
    },
    {
      field: "applicazioneChiamante",
      header: "Applicazione",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "200px",
      label: "Applicazione del documento",
      textAlign:"center"
    },
    {
      field: "tipoDocumento",
      header: "Tipo documento",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "150px",
      label: "Tipo del documento",
      textAlign:"center"
    },
    {
      field: "oggetto",
      header: "Oggetto",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      label: "Oggetto del documento",
      width: "150px",
      textAlign:"center"
    },
    {
      field: "fascicoli",
      header: "Fascicoli",
      label: "Fascicoli associati al documento",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      // width: "200px",
      // height: "100%",
      textAlign:"center"
    },
    {
      field: "documentoBabel",
      header: "Documento Babel",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "200px",
      label: "Documento Babel",
      textAlign:"center"
    },
    {
      field: "creatore",
      header: "Creatore",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "200px",
      label: "Creatore del documento ",
      textAlign:"center"
    },
    {
      field: "descrizioneStruttura",
      header: "Struttura ",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "200px",
      label: "Struttura del creatore ",
      textAlign:"center"
    },
    {
      field: "stato",
      header: "Azione",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "122px",
      label: "Azione",
      textAlign:"center"
    }
  ];

  onLoadRaccoltaSemplice() {
    this.datiDocumenti = [];
    if (!!this._azienda && !!this.dataInizio && this.dataInizio instanceof Date) {
      this.loading = true;
      if (!(!!this.dataFine && this.dataInizio instanceof Date)) {
        this.dataFine = new Date(this.dataOggi.toDateString());
      }
      this.subscriptions.push(
        this.raccoltaSempliceService.getRaccoltaSemplice(this._azienda.codice, this.datePipe.transform(this.dataInizio, 'yyyy-MM-dd'),this.datePipe.transform(this.dataFine, 'yyyy-MM-dd'), this.recordPerPagina, 0)
          .subscribe((res: HttpResponse<Document[]>) => {
            this.loading = false;
            this.datiDocumenti = res.body.map(document => { return ({ ...document,  date: (this.datePipe.transform(document.createTime, 'dd/MM/yyyy')) } as Document)});
            this.datiPaginati = this.datiDocumenti.slice(0, 10);
            console.log("Dati paginati: ", this.datiPaginati);
            console.log("Dati: ", this.datiDocumenti);
          }, error => {
            console.log("error raccoltaSempliceService.getRaccoltaSemplice", error);
            this.loading = false;     
          }
        )
      )
    }

    this.mostra = true;
  }

  handleSelectedAziendaEmit(event: Azienda, type: string) {
    console.log('%c handleSelectedAziendaEmit', 'background-color:violet;color:black;', event);
    this.azienda = event;
    if (!!this._azienda && !!this.dataInizio && this.dataInizio instanceof Date) {
      this.onLoadRaccoltaSemplice();
    }
  }

  onTableRefresh() {
    if (!!this._azienda && !!this.dataInizio && this.dataInizio instanceof Date) {
      console.log("Table Refresh");
      this.filtri = [];
      this.onLoadRaccoltaSemplice();
    }
  }

  exportToCsv(table: Table) {
    console.log("exportToCsv: ", table);
    if (this.totalRecords > 0) {
      this.exportCsvInProgress = true;
      const tableTemp = {} as Table;
      Object.assign(tableTemp, table);
      try {
        const exportColumns = this.cols.map(col => { return ({...col, title: col.header, dataKey: col.field }) });
        tableTemp.columns = exportColumns;
        tableTemp.value = this.datiDocumenti;
        const extractor = new CsvExtractor();
        extractor.exportCsv(tableTemp);
        this.exportCsvInProgress = false;
      } catch (e) {
        console.log("exportToCsv error: ", e);
        this.exportCsvInProgress = false;
      }
    }
  }

  public onCalendarAction(event: any, field: string, action: string) {
    let calSel: Calendar = null;
    switch (action) {
      case "today":
        this.newDate = event.toLocaleDateString();
        console.log("NewDate:", this.newDate);
        calSel = this._calGen.find(e => e.inputId === "CalInput_" + field);
        if (calSel) {
          calSel.overlayVisible = false;
        }
      break;

      case "clear":
        this.dataTable.filter(null, field, 'CalendarRange');
      break;

      case "select":
        if (this._calGen) {
          
          this.newDate = event.toLocaleDateString();
          console.log("NewDate:", this.newDate);
          calSel = this._calGen.find(a => a.inputId === "CalInput_" + field);
          if (calSel && this.dataRange && this.dataRange[field].length === 2
            && this.dataRange[field][0] && this.dataRange[field][1]) {
            calSel.overlayVisible = false;
          }
        }
        const value = this.dataRange[field];
        this.dataTable.filter(value, field, 'dateRangeFilter');
      break;
    }
  }

  calendarTooltip(field: string) {
    let tooltip: string = "";
    if (this.dataRange && this.dataRange[field]) {
      if (this.dataRange[field][0]) {
        tooltip += this.datePipe.transform(this.dataRange[field][0], "dd/MM/yyyy");
      }
      if (this.dataRange[field][1]) {
        tooltip += " - " + this.datePipe.transform(this.dataRange[field][1], "dd/MM/yyyy");
      }
    }
    return tooltip;
  }

  public ready(): boolean {
    return true;
  }

  public lazyLoad(event: LazyLoadEvent) {
    this.untouched = true;
    if (this.dataInizio == null) {
      return;
    }
    let offset = (event.first / event.rows) * this.recordPerPagina;
    this.loading = true;
    this.subscriptions.push(
      this.raccoltaSempliceService.getRaccoltaSemplice(this._azienda.codice, this.datePipe.transform(this.dataInizio, 'yyyy-MM-dd'),this.datePipe.transform(this.dataFine, 'yyyy-MM-dd'), this.recordPerPagina, offset)
        .subscribe((res: HttpResponse<Document[]>) => {
          this.loading = false;
          this.datiDocumenti = res.body.map(document => { return ({ ...document,  date: (this.datePipe.transform(document.createTime, 'dd/MM/yyyy')) } as Document)});
          this.datiPaginati = this.datiDocumenti.slice(0, 10);
          // for (let item of this.datiPaginati) {
          //   let fascicoli = item.fascicoli.split(" ");
          //   console.log("VALORI: ", fascicoli);
          //   for (let i = 0; i < fascicoli.length; i++) {
          //     fascicoli[i] = fascicoli[i] + "<br/>";
          //   }
          //   item.fascicoli = fascicoli.join("");
          // }
          
          
          console.log("Dati paginati: ", this.datiPaginati);
          console.log("Dati: ", this.datiDocumenti);
        }, error => {
          console.log("error raccoltaSempliceService.getRaccoltaSemplice", error);
          this.loading = false;     
        }
      )
    )


    if(event.filters.codice?.value != undefined) {
      this.filtri.push(this.datePipe.transform(this.dataInizio, 'yyyy-MM-dd'));
      this.filtriRicerca.push("numero");
      console.log("Inserimento: "+ this.filtri.length);
      this.untouched = false;
    }

    if(event.filters.applicazioneChiamante?.value != undefined) {
      this.filtri.push(event.filters.applicazioneChiamante?.value.toString());
      this.filtriRicerca.push("applicazioneChiamante");
      console.log("Inserimento: "+ this.filtri.length);
      this.untouched = false;
    }

    if(event.filters.createTime?.value != undefined) {
      this.filtri.push(this.newDate);
      this.filtriRicerca.push("createTime");
      console.log("Inserimento: "+ this.filtri.length);
      this.untouched = false;
    }



    //console.log("Filtro oggetto: " + event.filters.oggetto?.value);
    if(event.filters.oggetto?.value != undefined) {
      this.filtri.push(event.filters.oggetto?.value.toString());
      this.filtriRicerca.push("oggetto")
      console.log("Inserimento: "+ this.filtri.length);
      this.untouched = false;
    }


      //console.log("Filtro creatore: " + event.filters.creatore?.value);
      if(event.filters.creatore?.value != undefined) {
        this.filtri.push(event.filters.creatore?.value.toString());
        this.filtriRicerca.push("creatore");
        console.log("Inserimento: "+ this.filtri.length);
        this.untouched = false;
      }

      
      //console.log("Filtro registrazione" + event.filters.registrazione?.value);
      if(event.filters.registrazione?.value != undefined) {
        this.filtri.push(event.filters.registrazione?.value.toString());
        console.log("Inserimento: "+ this.filtri.length);
        this.untouched = false;
      }

     // console.log("Tipo documento: " + event.filters.tipoDocumento?.value);
      if(event.filters.tipoDocumento?.value != undefined) {
        this.filtri.push(event.filters.tipoDocumento?.value.toString());
        this.filtriRicerca.push("tipoDocumento");
        console.log("Inserimento: "+ this.filtri.length);
        this.untouched = false;
      }

      //console.log("Fascicoli: " + event.filters.fascicoli?.value);
      if(event.filters.fascicoli?.value != undefined) {
        this.filtri.push(event.filters.fascicoli?.value.toString());
        this.filtriRicerca.push("fascicoli");
        console.log("Inserimento: "+ this.filtri.length);
        this.untouched = false;
      }

      //console.log("Documento Babel: " + event.filters.documentoBabel?.value);
      if(event.filters.documentoBabel?.value != undefined) {
        this.filtriRicerca.push("documentoBabel");
        this.filtri.push(event.filters.documentoBabel?.value.toString());
        console.log("Inserimento: "+ this.filtri.length);
        this.untouched = false;
      }

      //console.log("Struttura: " + event.filters.descrizioneStruttura?.value);
      if(event.filters.descrizioneStruttura?.value != undefined) {
        this.filtriRicerca.push("struttura");
        this.filtri.push(event.filters.descrizioneStruttura?.value.toString());
        console.log("Inserimento: "+ this.filtri.length);
        this.untouched = false;
      }
      if(this.untouched) {
        // this.loading = false;
        return;
      }
      

      this.sendFilters();
      this.filtri = [];
      this.filtriRicerca = [];
      console.log("Svuoto i filtri");  
  }

  private download(idSottodocumento: string, name: string, mimetype: string): void {
    let index = mimetype.indexOf("/");
    let extension = mimetype.substr(index + 1);
    let fileName = name + "." + extension;
    this.raccoltaSempliceService.downloadAllegato(this._azienda.codice, idSottodocumento).subscribe(response => {
    this.downLoadFile(response, mimetype, fileName, false );
  });
}


  public sendFilters() {
    this.datiDocumenti = [];
    this.loading = true;
    console.log("Sono nella send filters");
    this.subscriptions.push(
      this.raccoltaSempliceService.ricercaRaccolta(this.filtri, this.filtriRicerca)
        .subscribe((res: HttpResponse<Document[]>) => {
          
          this.datiDocumenti = res.body.map(document => { return ({ ...document,  date: (this.datePipe.transform(document.createTime, 'dd/MM/yyyy')) } as Document)});
          this.loading = false;
        }, error => {
          console.log("error raccoltaSempliceService.ricercaRaccolta", error);
          this.loading = false;     
        }
      )
    )
  }

  public downLoadFile(data: any, type: string, filename: string, preview: boolean = false) {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob, );
    if (preview && (this.contentTypesEnabledForPreview.indexOf(type) > -1)) {
      const pwa = window.open(url);
      if (!pwa || pwa.closed || typeof pwa.closed === "undefined") {
        alert("L'apertura del pop-up è bloccata dal tuo browser. Per favore disabilita il blocco.");
      } else {
        setTimeout(() => {
          // console.log("FILE = ", filename, type);
          if (type && type === "application/pdf") {
            pwa.document.getElementsByTagName("html")[0]
            .appendChild(document.createElement("head"))
            .appendChild(document.createElement("title"))
            .appendChild(document.createTextNode(filename));
          } else {
            pwa.document.title = filename;
          }
        }, 0);
      }
    } else {
      const anchor = document.createElement("a");
      anchor.setAttribute("type", "hidden");
      anchor.download = filename;
      anchor.href = url;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  }


  openModal(id: string) { 
    this.lastStato = this.getStato(id);
    this.display = true;
    this.idRaccoltaTemp = id;
    this.subscriptions.push(
      this.raccoltaSempliceService.getStorico(id, this._azienda.codice).subscribe(
        (res: HttpResponse<Storico[]>) => { 
            this.storici = res.body.map(storico => { return ({ ...storico } as Storico) });
        }, error => {
            console.log("error raccoltaSempliceService.getStorico", error);
        })
    );
  }

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }

  getStato(idRacc: string) : boolean {
    let document = this.datiDocumenti.find(documento => documento.id.toString() == idRacc );
    console.log("Id trovato: " + document.id);
    console.log("Id passato: " + idRacc);
    if(document.stato == "ATTIVO") {
      console.log("Stato: "+ document.stato);
      return true;
    }
    if(document.stato == "ANNULLATO") {
      console.log("Stato: " + document.stato);
      return false;
    }
      return null;     
    }


  ngOnInit(): void {
    this.recordPerPagina = 3;

    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      this.loggedUser = u;
      this.azienda = u.getUtente().aziendaLogin;
      console.log("Azienda: ",u.getUtente());
    }));
    FilterUtils['dateRangeFilter'] = (value: Date, filter: [Date, Date]): boolean => {
      var v = new Date(value);
      // get the from/start value
      var s = filter[0].getTime();
      var e;
      // the to/end value might not be set
      // use the from/start date and add 1 day
      // or the to/end date and add 1 day
      if ( filter[1]) {
        e =  filter[1].getTime() + 86400000;
      } else {
        e = s + 86400000;
      }
      // compare it to the actual values
      return v.getTime() >= s && v.getTime() <= e;
    }
  }

  onHide() : void {
    this.display = false;
    this.testoMotivazione = "";
    this.radioStato = "";
    this.idRaccoltaTemp = "";
    this.selectedButton = "";
  }

  onSubmit() : void {
    this.lastStato = this.getStato(this.idRaccoltaTemp);
    if(this.lastStato)
      this.radioStato = "ANNULLATO";
    else
      this.radioStato = "ATTIVO"; 
    let utente: string = this.loggedUser.getUtente().username;

    let stringJSON : string = '{ "id_raccolta": "'+this.idRaccoltaTemp+'", "utente":"'+utente+'", "azione":"'+this.radioStato+
                              '", "motivazione":"'+this.testoMotivazione+'", "azienda":"'+this._azienda.codice+'" }';
    let jsonBody = JSON.parse(stringJSON);
    console.log("Body: "+ stringJSON);
    this.raccoltaSempliceService.updateAnnullamento(jsonBody);
    this.display = false;
    this.radioStato = "";
    this.testoMotivazione = "";
    this.idRaccoltaTemp = "";
    this.selectedButton = "";
  }

}

