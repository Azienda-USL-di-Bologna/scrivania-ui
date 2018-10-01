import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LazyLoadEvent } from 'primeng/api';
import { FILTER_TYPES, FiltersAndSorts, SortDefinition, SORT_MODES, LOCAL_IT, UtilityFunctions } from '@bds/nt-communicator';
import { buildLazyEventFiltersAndSorts } from '@bds/primeng-plugin';
import { AttivitaService } from './attivita.service';
import { PROJECTIONS } from '../../environments/app-constants';
import { Attivita } from '@bds/ng-internauta-model';

@Component({
  selector: 'app-tabella-attivita',
  templateUrl: './tabella-attivita.component.html',
  styleUrls: ['./tabella-attivita.component.css'],
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
  
  constructor(private datepipe: DatePipe, private attivitaService: AttivitaService) { }

  ngOnInit() {
    this.cols = [
      {
        field:"priorita",
        header: "Priorita",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "tipo",
        header: "Tipo",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "idAzienda.nome",
        header: "Azienda",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "idApplicazione.nome",
        header: "Applicazione",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "mittente",
        header: "Mittente",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "oggetto",
        header: "Oggetto",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        field: "dataInserimentoRiga",
        header: "Data inserimento",
        filterMatchMode: FILTER_TYPES.not_string.equals,
        fieldType: "DateTime",
        filterWidget: "Calendar",
        ariaLabelDescription: "Colonna Inserimento, Cella filtro"
      },
      {
        field: "descrizione",
        header: "Descrizione",
        filterMatchMode: FILTER_TYPES.string.containsIgnoreCase
      },
      {
        // colonna pencil
      },
      {
        // colonna thrash
      },
    ];
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

  public handleEvent(nome: string, event) {
    const functionName = "handleEvent";
    //console.log(this.componentDescription, functionName, "nome:", nome, "event:", event);
    switch (nome) {
      case "onLazyLoad":
        this.loadLazy(event);
        break;
    }
  }


  private loadLazy(event: LazyLoadEvent) {
    const functionName = "lazyLoad"
    //console.log(this.componentDescription, functionName, "event: ", event);
    this.loadData(event);
  }

  private buildInitialFiltersAndSorts(): FiltersAndSorts {
    const functionName = "buildInitialFiltersAndSorts";
    let initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addSort(new SortDefinition("dataInserimentoRiga", SORT_MODES.asc));
    //console.log(this.componentDescription, functionName, "initialFiltersAndSorts:", initialFiltersAndSorts);
    return initialFiltersAndSorts;
  }


  private loadData(event: LazyLoadEvent) {
    const functionName = "loadData"
    //console.log(this.componentDescription, functionName, "event: ", event);

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
            console.log('ATTIVITA: ', this.attivita)
            //console.log(this.componentDescription, functionName, "struttureUnificate: ", this.struttureUnificate);
          }
        }
      );
      
  }



}
