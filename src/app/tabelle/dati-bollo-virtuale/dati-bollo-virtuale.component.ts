import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Azienda } from '@bds/ng-internauta-model';
import { BolloVirtuale } from './bollo.model';
import { BolloVirtualeService } from './bollo-virtuale.service';
import { FILTER_TYPES, FiltersAndSorts, SortDefinition, FilterDefinition, SORT_MODES, AdditionalDataDefinition } from '@nfa/next-sdr';
import { PROJECTIONS } from 'src/environments/app-constants';
import { Subscription } from 'rxjs';
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';
import { HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';

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
  public totalRecords: number;
  public _rows = 20;
  private subscriptions: Subscription[]=[];
  public loggedUser: UtenteUtilities;

  public cols: any[] = [
    {
      field: "codiceRegistroDoc",
      header: "Registro",
      width: "85px",
      padding: 0,
      label: "codice registro",
      textAlign: "center",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    },
    {
      field: "numeroDoc",
      header: "No.Doc.",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "106px",
      label: "numero documento",
      textAlign:"center"
    },
    {
      field: "annoNumeroDoc",
      header: "Anno",
      filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
      width: "88px",
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
      width: "109px",
      label: "numero facciate bollo",
      textAlign:"center"
    },
    {
      field: "noRigheBollo",
      header: "Righe",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "90px",
      label: "numero righe di bollo",
      textAlign:"center"
    },
    {
      field: "noBolliAltriImporti",
      header: "Altri Importi",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "104px",
      label: "numero bolli altri importi",
      textAlign:"center"
    },
    {
      field: "importoBolliAltriImporti",
      header: "Importo Altri",
      filterMatchMode: FILTER_TYPES.not_string.equals,
      width: "104px",
      label: "importo bolli altri importi",
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
    this.onLoadDatiBolliVirtuali(event.codice);
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


  onLoadDatiBolliVirtuali(aziendaCodice: string) {
    console.log("call to service to load dati virtuali", event);
    this.loading = true;
    
    this.subscriptions.push(
      this.bolloVirtualeService.getDatiBolliVirtuali(aziendaCodice)
        .subscribe((res: HttpResponse<BolloVirtuale[]>) => {
          this.loading = false;
          // this.datiBolliVirtuali = res.body.map((bollo:BolloVirtuale)=>{...bollo, dataNumeroDoc:new DatePipe('en-US').transform(bollo.dataNumeroDoc, 'yyyy-dd-MM')});
          this.datiBolliVirtuali = res.body.map(bollo => { return ({ ...bollo, date: (this.datePipe.transform(bollo.dataNumeroDoc, 'dd-MM-yyyy')) } as BolloVirtuale) });
          this.totalRecords = this.datiBolliVirtuali.length;
          console.log("bolloVirtualeService.getDatiBolliVirtuali", res);
          console.log("datiBolliVirtuali", this.datiBolliVirtuali);
        }, error => {
          console.log("bolloVirtualeService.getDatiBolliVirtuali", error);
          this.loading = false;
        }
      )
    )
  }

  onTableRefresh() {
    if (!!this._azienda.codice) {
      console.log("onTableRefresh");
      this.onLoadDatiBolliVirtuali(this._azienda.codice);
    }
  }

  onKeydownHandlerArrowDown(event) {
    console.log("onKeydownHandlerArrowDown", event);
  }

  onKeydownHandlerArrowUp(event) {
    console.log("onKeydownHandlerArrowUp", event);
  }

  ngOnDestroy(): void {
    if (this.subscriptions && this.subscriptions.length > 0) {
      while (this.subscriptions.length > 0) {
        this.subscriptions.pop().unsubscribe();
      }
    }
  }

}
