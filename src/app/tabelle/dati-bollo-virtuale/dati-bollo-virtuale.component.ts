import { Component, OnInit, Input, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Azienda } from '@bds/ng-internauta-model';
import { BolloVirtuale } from './bollo.model';
import { BolloVirtualeService } from './bollo-virtuale.service';
import { FILTER_TYPES, FiltersAndSorts, SortDefinition, FilterDefinition, SORT_MODES, AdditionalDataDefinition } from '@nfa/next-sdr';
import { PROJECTIONS } from 'src/environments/app-constants';
import { Subscription } from 'rxjs';
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';
import { HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Table } from 'primeng-lts/table';
import { CsvExtractor } from '@bds/primeng-plugin';
import { LOCAL_IT } from '@bds/nt-communicator';

@Component({
  selector: 'app-dati-bollo-virtuale',
  templateUrl: './dati-bollo-virtuale.component.html',
  styleUrls: ['./dati-bollo-virtuale.component.css']
})
export class DatiBolloVirtualeComponent implements OnInit, OnDestroy {
  _azienda: Azienda;
  @Input() set azienda(aziendaValue: Azienda) {
    if (aziendaValue) {
      this._azienda = aziendaValue;
    }
  }

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

  public cols: any[] = [
    {
      field: "codiceRegistroDoc",
      header: "Registro",
      width: "98px",
      padding: 0,
      label: "codice registro",
      textAlign: "center",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    },
    {
      field: "numeroDoc",
      header: "No.Doc.",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "122px",
      label: "numero documento",
      textAlign:"center"
    },
    {
      field: "annoNumeroDoc",
      header: "Anno",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "102px",
      label: "anno della numerazione del doc",
      textAlign:"center"
    },
    {
      field: "date",
      header: "Data",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "100px",
      label: "data della numerazione del doc",
      fieldType: "DateTime",
      textAlign:"center"
    },
    {
      field: "oggettoDoc",
      header: "Oggetto",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      label: "oggetto"
    },
    {
      field: "redattoreDoc",
      header: "Redattore",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      ariaLabelDescription: "Colonna Data, Cella filtro",
      width: "200px",
      label: "redattore del documento"
    },
    {
      field: "noFacciateBollo",
      header: "Facciate",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "122px",
      label: "numero facciate bollo",
      textAlign:"center"
    },
    {
      field: "noRigheBollo",
      header: "Righe",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "105px",
      label: "numero righe di bollo",
      textAlign:"center"
    },
    {
      field: "noBolliAltriImporti",
      header: "no. Altri Importi",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "119px",
      label: "numero bolli altri importi",
      textAlign:"center"
    },
    {
      field: "importoBolliAltriImporti",
      header: "€ Importo Altri",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "105px",
      label: "importo bolli altri importi in euro",
      textAlign:"center"
    }
  ];

  constructor(private bolloVirtualeService: BolloVirtualeService, private loginService: NtJwtLoginService, private datePipe: DatePipe) { }

  ngOnInit() {
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      this.loggedUser = u;
      this.azienda = u.getUtente().aziendaLogin;
      console.log("Azienda: ",u.getUtente());
    }));
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
            
            this.datiBolliVirtuali = res.body.map(bollo => { return ({ ...bollo, date: (this.datePipe.transform(bollo.dataNumeroDoc, 'dd/MM/yyyy')) } as BolloVirtuale) });
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
      let duration = total;
      let timeout = 10;
      if (total > 10000 && total < 10000000 ) {
        duration = 200;
        timeout = 1;
      } else if (total > 10000000) {
        duration = 20;
        timeout = 1;
      }
      const count = +element.nativeElement.innerText;
      if (duration == 0) {
        duration = 1;
      }
      const inc = total / duration;
      if (count <= total) {
        element.nativeElement.innerText = Math.ceil(this.sum(count, inc)).toString();
        setTimeout(()=> this.updateCount(total,element),timeout);
      } else {
        element.nativeElement.innerText = total.toString();
      }
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

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }

}
