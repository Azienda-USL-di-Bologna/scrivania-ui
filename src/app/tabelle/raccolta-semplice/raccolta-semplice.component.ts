import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Inject, Input, OnInit, QueryList, ViewChild,  ViewChildren } from '@angular/core';
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
import { ModalService } from './dettaglio-annullamento/modal/modal-service';
import { Storico } from './dettaglio-annullamento/modal/storico';

@Component({
  selector: 'app-raccolta-semplice',
  templateUrl: './raccolta-semplice.component.html',
  styleUrls: ['./raccolta-semplice.component.css']
})
export class RaccoltaSempliceComponent implements OnInit {
//@Inject(ModalService) private modalService: ModalService
  constructor(private raccoltaSempliceService: RaccoltaSempliceService, private loginService: NtJwtLoginService, private datePipe: DatePipe) { }

  _azienda: Azienda;
  @Input() set azienda(aziendaValue: Azienda) {
    if (aziendaValue) {
      this._azienda = aziendaValue;
    }
  }

  public storici: Storico[] = [];  
  public display = false;
  public mostra = false;
  public dataRange: Date[] = [];
  public datiDocumenti: Document[] = [];
  public prova: Document[] = [];
  public loading: boolean = false;
  public _rows = 20;
  private subscriptions: Subscription[]=[];
  public loggedUser: UtenteUtilities;
  public exportCsvInProgress: boolean = false;
  public totalRecords: number = 0;
  public it = LOCAL_IT;
  public dataOggi: Date = new Date();
  public dataInizio: Date = null;
  public dataFine: Date = new Date(this.dataOggi.toDateString());

  @ViewChild("tableRaccoltaSemplice") private dataTable: Table;
  @ViewChildren("calGen") private _calGen: QueryList<Calendar>;

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
      filterMatchMode: FILTER_TYPES.not_string.equals,
      label: "Data registrazione",
      filterWidget: "Calendar",
      fieldType: "DateTime",
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
      width: "200px",
      height: "100%",
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
        this.raccoltaSempliceService.getRaccoltaSemplice(this._azienda.codice, this.datePipe.transform(this.dataInizio, 'yyyy-MM-dd'),this.datePipe.transform(this.dataFine, 'yyyy-MM-dd'))
          .subscribe((res: HttpResponse<Document[]>) => {
            this.loading = false;
            this.datiDocumenti = res.body.map(document => { return ({ ...document,  date: (this.datePipe.transform(document.createTime, 'dd/MM/yyyy')) } as Document)});
            console.log("Coinvolti: ", this.datiDocumenti[0].coinvolti); 
          }, error => {
            console.log("error raccoltaSempliceService.getRaccoltaSemplice", error);
            this.loading = false;     
          }
        )
      )
    }

    this.mostra = true;

    //console.log("Valori datiDocumenti: " + this.datiDocumenti[0].oggetto);
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

  openModal(id: string) {
    console.log("Dentro open, id: "+ id);
    
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      this.loggedUser = u;
      this.azienda = u.getUtente().aziendaLogin;
      console.log("Azienda: ",u.getUtente()); 
      this.raccoltaSempliceService.getStorico(id, this.azienda.codice).subscribe(
        (res: HttpResponse<Storico[]>) => {
            this.storici = res.body.map(storico => { return ({ ...storico } as Storico) });
        }, error => {
            console.log("error raccoltaSempliceService.getStorico", error);
        })
    })); 
      this.display = true;
  }

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }

  ngOnInit(): void {
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

}
