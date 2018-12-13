import { Component, OnInit } from '@angular/core';
import { DatePipe } from "@angular/common";
import { LazyLoadEvent } from "primeng/api";
import { FILTER_TYPES, FiltersAndSorts, SortDefinition, SORT_MODES, LOCAL_IT, FilterDefinition, NO_LIMIT } from "@bds/nt-communicator";
import { buildLazyEventFiltersAndSorts } from "@bds/primeng-plugin";
import { AttivitaFatteService } from "./attivita-fatte.service";
import { PROJECTIONS } from "../../../environments/app-constants";
import { AttivitaFatta } from "@bds/ng-internauta-model";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { Table } from "primeng/table";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-attivita-fatte',
  templateUrl: './attivita-fatte.component.html',
  styleUrls: ['./attivita-fatte.component.css'],
  providers: [DatePipe]
})
export class AttivitaFatteComponent implements OnInit {

  public attivitaFatte: AttivitaFatta[];
  public totalRecords: number;
  public localIt = LOCAL_IT;

  public dataRange: any = {};
  private previousEvent: LazyLoadEvent;
  private initialFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  private lazyLoadFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  public loggedUser: UtenteUtilities;
  public loading: boolean = true; // lasciare questo a true se no da errore in console al primo caricamento delle attività
  public selectedRowIndex: number = -1;
  private subscriptions: Subscription[];

  public cols: any[] = [
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

  constructor(private datepipe: DatePipe, private attivitaFatteService: AttivitaFatteService, private loginService: NtJwtLoginService) { }

  ngOnInit() {
    this.subscriptions = [];
    this.subscriptions.push(this.loginService.loggedUser$.subscribe((u: UtenteUtilities) => {
      this.loggedUser = u;
    }));
    this.loadData(null);
    
  }

  private loadData(event: LazyLoadEvent) {
    this.loading = true;
    const functionName = "loadData";

    // mi salvo il filtro dell'evento così, se cambio struttura o azienda posso ricaricare i dati applicando quel filtro
    // in alternativa potrei svuotare i filtri al cambio di struttura e azienda
    if (event) {
      this.previousEvent = event;
      this.lazyLoadFiltersAndSorts = buildLazyEventFiltersAndSorts(event, this.cols, this.datepipe);
    }
    this.initialFiltersAndSorts = this.buildInitialFiltersAndSorts(); // non so se è corretto metterlo qui o forse nel set strutturaSelezionata

    this.attivitaFatteService.getData(PROJECTIONS.attivitaFatta.standardProjections.AttivitaFattaWithIdApplicazioneAndIdAzienda, this.initialFiltersAndSorts, this.lazyLoadFiltersAndSorts)
      .then(
        data => {
          this.attivitaFatte = undefined;
          this.totalRecords = 0;
          if (data && data._embedded && data.page) {
            this.attivitaFatte = <AttivitaFatta[]>data._embedded.attivitafatta;
            this.totalRecords = data.page.totalElements;
            this.attivitaFatte.forEach(a => {
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

  private buildInitialFiltersAndSorts(): FiltersAndSorts {
    const functionName = "buildInitialFiltersAndSorts";
    let initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addSort(new SortDefinition("dataInserimentoRiga", SORT_MODES.desc));
    const filter: FilterDefinition = new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.loggedUser.getUtente().fk_idPersona.id);
    initialFiltersAndSorts.addFilter(filter);
    initialFiltersAndSorts.rows = NO_LIMIT;
    return initialFiltersAndSorts;
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
        // do nothing
        break;
    }
  }

  private lazyLoad(event: LazyLoadEvent) {
    const functionName = "lazyLoad";
    this.loadData(event);
  }

  public onKeydownHandlerArrowDown(event: KeyboardEvent) {
    // this.selectIndex(this.selectedRowIndex + 1);
  }

  public onKeydownHandlerArrowUp(event: KeyboardEvent) {
    // this.selectIndex(this.selectedRowIndex - 1);
  }

}
