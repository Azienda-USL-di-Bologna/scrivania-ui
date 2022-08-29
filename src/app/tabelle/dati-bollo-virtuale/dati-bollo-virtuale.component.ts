import { Component, OnInit, Input, OnDestroy, ElementRef, ViewChild, ViewChildren, QueryList  } from '@angular/core';
import { Azienda } from '@bds/internauta-model';
import { BolloVirtuale } from './bollo.model';
import { BolloVirtualeService } from './bollo-virtuale.service';
import { FILTER_TYPES } from '@bds/next-sdr';
import { Subscription } from 'rxjs';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Table } from 'primeng/table';
import { CsvExtractor, LOCAL_IT } from '@bds/common-tools';
import { Calendar } from 'primeng/calendar';
import { FilterService } from "primeng/api";

@Component({
  selector: 'app-dati-bollo-virtuale',
  templateUrl: './dati-bollo-virtuale.component.html',
  styleUrls: ['./dati-bollo-virtuale.component.scss']
})
export class DatiBolloVirtualeComponent implements OnInit, OnDestroy {
  _azienda: Azienda;
  @Input() set azienda(aziendaValue: Azienda) {
    if (aziendaValue) {
      this._azienda = aziendaValue;
    }
  }

  public dataRange: Date[] = [];

  public datiBolliVirtuali: BolloVirtuale[]=[];
  public loading: boolean = false;
  public _rows = 20;
  private subscriptions: Subscription[]=[];
  public loggedUser: UtenteUtilities;
  public exportCsvInProgress: boolean = false;
  
  public totalRecords: number = 0;
  public totalFacciateBollo: number = 0;
  public totalRigheBollo: number = 0;
  public totalAltriImportiBollo: number = 0;
  public totalImportoAltriBollo: number = 0;

  public it = LOCAL_IT;
  public dataOggi: Date = new Date();
  public dataInizio: Date = null;
  public dataFine: Date = new Date(this.dataOggi.toDateString());

  @ViewChild('totalRecordsRef', { static: false }) totalRecordsRef?: ElementRef<HTMLElement>; 
  @ViewChild('totalFacciateBolloRef', { static: false }) totalFacciateBolloRef?: ElementRef<HTMLElement>; 
  @ViewChild('totalRigheBolloRef', { static: false }) totalRigheBolloRef?: ElementRef<HTMLElement>; 
  @ViewChild('totalAltriImportiBolloRef', { static: false }) totalAltriImportiBolloRef?: ElementRef<HTMLElement>; 
  @ViewChild('totalImportoAltriBolloRef', { static: false }) totalImportoAltriBolloRef?: ElementRef<HTMLElement>; 

  @ViewChild("tableBolliVirtuali") private dataTable: Table;
  @ViewChildren("calGen") private _calGen: QueryList<Calendar>;

  public cols: any[] = [
    {
      field: "codiceRegistroDoc",
      header: "Registro",
      width: "100px",
      padding: 0,
      label: "codice registro",
      textAlign: "center",
      filterMatchMode: FILTER_TYPES.string.contains
    },
    {
      field: "numeroDoc",
      header: "No.Doc.",
      filterMatchMode: FILTER_TYPES.string.contains,
      width: "124px",
      label: "numero documento",
      textAlign:"center"
    },
    {
      field: "annoNumeroDoc",
      header: "Anno",
      filterMatchMode: FILTER_TYPES.string.contains,
      width: "104px",
      label: "anno della numerazione del doc",
      textAlign:"center"
    },
    {
      field: "dataNumeroDoc",
      header: "Data",
      filterMatchMode: '',
      width: "100px",
      label: "data della numerazione del doc",
      fieldType: "DateTime",
      textAlign:"center"
    },
    {
      field: "oggettoDoc",
      header: "Oggetto",
      filterMatchMode: FILTER_TYPES.string.contains,
      label: "oggetto",
      minWidth: "200px"
    },
    {
      field: "redattoreDoc",
      header: "Redattore",
      filterMatchMode: FILTER_TYPES.string.contains,
      ariaLabelDescription: "Colonna Data, Cella filtro",
      width: "200px",
      label: "redattore del documento"
    },
    {
      field: "nomeStruttura",
      header: "Struttura del documento",
      filterMatchMode: FILTER_TYPES.string.contains,
      ariaLabelDescription: "Colonna Data, Cella filtro",
      width: "200px",
      label: "Struttura del documento"
    },
    {
      field: "noFacciateBollo",
      header: "Facciate",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "126px",
      label: "numero facciate bollo",
      textAlign:"center"
    },
    {
      field: "noRigheBollo",
      header: "Righe",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "108px",
      label: "numero righe di bollo",
      textAlign:"center"
    },
    {
      field: "noBolliAltriImporti",
      header: "no. Altri Importi",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "121px",
      label: "numero bolli altri importi",
      textAlign:"center"
    },
    {
      field: "importoBolliAltriImporti",
      header: "€ Importo Altri",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "107px",
      label: "importo bolli altri importi in euro",
      textAlign:"center"
    }
  ];

  constructor(
      private bolloVirtualeService: BolloVirtualeService, 
      private loginService: JwtLoginService, 
      private datePipe: DatePipe,
      private filterService: FilterService) { }

  ngOnInit() {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      this.loggedUser = u;
      this.azienda = u.getUtente().aziendaLogin;
      console.log("Azienda: ",u.getUtente());
    }));
    
    this.filterService.register("dateRangeFilter", (value: Date, filter: [Date, Date]): boolean => {
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
    });
  }

  handleSelectedAziendaEmit(event: Azienda, type: string) {
    console.log('%c handleSelectedAziendaEmit', 'background-color:violet;color:black;', event);
    this.azienda = event;
    if (!!this._azienda && !!this.dataInizio && this.dataInizio instanceof Date) {
      this.onLoadDatiBolliVirtuali();
    }
  }

  public handleEvent(nome: string, event: any) {
    const functionName = "handleEvent";
    switch (nome) {
      case "onLazyLoad":
        // this.onLoadDatiBolliVirtuali(event);
        break;
      case "onRowSelect":
        // do nothing
        break;
    }
  }


  onLoadDatiBolliVirtuali() {
    this.datiBolliVirtuali = [];
    this.totalRecords = 0;
    this.resetTotalFields();

    if (!!this._azienda && !!this.dataInizio && this.dataInizio instanceof Date) {
      this.loading = true;
      if (!(!!this.dataFine && this.dataInizio instanceof Date)) {
        this.dataFine = new Date(this.dataOggi.toDateString());
      }

      // console.log("data inizio",this.datePipe.transform(this.dataInizio, 'yyyy-MM-dd'));
      // console.log("data fine", this.datePipe.transform(this.dataFine, 'yyyy-MM-dd'));

      this.subscriptions.push(
        this.bolloVirtualeService.getDatiBolliVirtuali(this._azienda.codice, this.datePipe.transform(this.dataInizio, 'yyyy-MM-dd'),this.datePipe.transform(this.dataFine, 'yyyy-MM-dd'))
          .subscribe((res: HttpResponse<BolloVirtuale[]>) => {
            this.loading = false;
            
            this.datiBolliVirtuali = res.body.map(bollo => { return ({ ...bollo } as BolloVirtuale) });
            this.sanatoriaBolli();
            this.calculateTotal(this.datiBolliVirtuali);
          }, error => {
            console.log("error bolloVirtualeService.getDatiBolliVirtuali", error);
            this.loading = false;
          }
        )
      )
    }

  }

  private rigaNulla(v: BolloVirtuale): boolean {
    if(v.noFacciateBollo != 0 || v.importoBolliAltriImporti != 0 || v.noRigheBollo != 0 || v.noBolliAltriImporti != 0 )
      return false;
    else
      return true;  
  }

  private sanatoriaBolli() {
    let nuoviBolli: BolloVirtuale[] = this.datiBolliVirtuali;
    nuoviBolli.forEach((value,index)=>{
      if(this.rigaNulla(value)) {
        nuoviBolli.splice(index,1);
      }
    });

    this.datiBolliVirtuali = nuoviBolli;  
  }

  private calculateTotal(bolli: BolloVirtuale[]) {
    this.totalRecords = 0;
    this.totalRigheBollo = 0;
    this.totalFacciateBollo = 0;
    this.totalAltriImportiBollo  = 0;
    this.totalImportoAltriBollo = 0;
    
    if (!!bolli && Array.isArray(bolli) && bolli.length > 0) {
      this.totalRecords = this.datiBolliVirtuali.length;
      this.totalRigheBollo = bolli.map(bollo => bollo.noRigheBollo).reduce(this.sum);
      this.totalFacciateBollo = bolli.map(bollo => bollo.noFacciateBollo).reduce(this.sum);
      this.totalAltriImportiBollo = bolli.map(bollo => bollo.noBolliAltriImporti).reduce(this.sum);
      this.totalImportoAltriBollo = bolli.map(bollo => bollo.importoBolliAltriImporti).reduce(this.sum);
    } 

    this.updateCount(this.totalRecords, this.totalRecordsRef);
    this.updateCount(this.totalRigheBollo, this.totalRigheBolloRef);
    this.updateCount(this.totalFacciateBollo, this.totalFacciateBolloRef);
    this.updateCount(this.totalAltriImportiBollo, this.totalAltriImportiBolloRef);
    this.updateCount(this.totalImportoAltriBollo, this.totalImportoAltriBolloRef);
  }

  private resetTotalFields() {
    this.setInnerTextZero(this.totalRecordsRef);
    this.setInnerTextZero(this.totalFacciateBolloRef);
    this.setInnerTextZero(this.totalRigheBolloRef);
    this.setInnerTextZero(this.totalAltriImportiBolloRef);
    this.setInnerTextZero(this.totalImportoAltriBolloRef);
  }

  private setInnerTextZero(element: ElementRef<HTMLElement>) {
    element.nativeElement.innerText = '0';
  }

  private updateCount(total: number, element: ElementRef<HTMLElement>) {
      element.nativeElement.innerText = total.toString();
  }

  private sum = (a: number, b: number) => {
    return a + b;
  }

  onTableRefresh() {
    if (!!this._azienda && !!this.dataInizio && this.dataInizio instanceof Date) {
      console.log("Table Refresh");
      this.onLoadDatiBolliVirtuali();
    }
  }

  onKeydownHandlerArrowDown(event) {
    console.log("onKeydownHandlerArrowDown", event);
  }

  onKeydownHandlerArrowUp(event) {
    console.log("onKeydownHandlerArrowUp", event);
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
        tableTemp.value = this.datiBolliVirtuali;
  
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

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }

}
