import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ColonnaBds } from "@bds/common-tools";
import { Job } from "@bds/internauta-model";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { FiltersAndSorts, NextSDREntityProvider, PagingConf } from "@bds/next-sdr";
import { buildLazyEventFiltersAndSorts } from "@bds/primeng-plugin";
import { LazyLoadEvent } from "primeng/api";
import { Subscription } from "rxjs";
import { ExtendedJobService } from "./extendend-job.service";
import { cols } from "./job-constants";

@Component({
  selector: "monitor-masterjobs",
  templateUrl: "./monitor-masterjobs.component.html",
  styleUrls: ["./monitor-masterjobs.component.scss"],
})
export class MonitorMasterjobsComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private loadJobSubscription: Subscription;
  private loadJobCountSubscription: Subscription;
  private pageConf: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 0, offset: 0 } };
  private storedLazyLoadEvent: LazyLoadEvent;

  public loggedUser: UtenteUtilities;
  public jobs: Job[] = [];
  public columns: ColonnaBds[] = cols;
  public totalRecords: number = 0;
  public loading: boolean = false;
  public rowsNumber: number = 20;
  public spinActive: boolean = false;
  public rowCount: number;

  constructor(private loginService: JwtLoginService, private jobService: ExtendedJobService, private datepipe: DatePipe) {}

  ngOnInit() {}

  public relaunchJobsInError(): void {
    this.spinActive = true;
    this.jobService.relaunchJobsInError().subscribe({
      next: (res) => {
        console.log("fatto");
        this.spinActive = false;
      },
      error: async (err) => {},
    });
  }

  public regenerateQueue(): void {
    this.spinActive = true;
    this.jobService.regenerateQueue().subscribe({
      next: (res) => {
        console.log("fatto");
        this.spinActive = false;
      },
      error: async (err) => {},
    });
  }

  private loadData(): void {
    this.pageConf.conf = {
      limit: this.storedLazyLoadEvent.rows,
      offset: this.storedLazyLoadEvent.first,
    };
    if (this.loadJobSubscription) {
      this.loadJobSubscription.unsubscribe();
      this.loadJobSubscription = null;
    }
    const lazyFiltersAndSorts: FiltersAndSorts = buildLazyEventFiltersAndSorts(this.storedLazyLoadEvent, this.columns, this.datepipe);
    this.loadCount(this.jobService as NextSDREntityProvider, null, null, lazyFiltersAndSorts);
    this.loadJobSubscription = this.jobService.getData(null, null, lazyFiltersAndSorts, this.pageConf).subscribe(
      (data: any) => {
        console.log(data);
        this.totalRecords = data.page.totalElements;
        this.loading = false;

        const results = data.results;

        if (this.pageConf.conf.offset === 0 && data.page.totalElements < this.pageConf.conf.limit) {
          /* Questo meccanismo serve per cancellare i risultati di troppo della tranche precedente.
					Se entro qui probabilmente ho fatto una ricerca */
          Array.prototype.splice.apply(this.jobs, [0, this.jobs.length, ...results]);
        } else {
          Array.prototype.splice.apply(this.jobs, [this.storedLazyLoadEvent.first, this.storedLazyLoadEvent.rows, ...results]);
        }
        this.jobs = [...this.jobs]; // trigger change detection
      },
      (err) => {}
    );
  }

  private loadCount(serviceToUse: NextSDREntityProvider, projectionFotGetData: string, filtersAndSorts: FiltersAndSorts, lazyFiltersAndSorts: FiltersAndSorts): void {
    this.spinActive = true;
    if (this.loadJobCountSubscription) {
      this.loadJobCountSubscription.unsubscribe();
      this.loadJobCountSubscription = null;
    }
    const pageConf: PagingConf = { mode: "LIMIT_OFFSET", conf: { limit: 1, offset: 0 } };
    //private pageConfNoLimit: PagingConf = {conf: {page: 0,size: 999999},mode: "PAGE_NO_COUNT"};
    this.loadJobCountSubscription = serviceToUse.getData(projectionFotGetData, filtersAndSorts, lazyFiltersAndSorts, pageConf).subscribe({
      next: (data: any) => {
        this.rowCount = data.page.totalElements;
        this.spinActive = false;
      },
      error: (err) => {
        console.log("Non sono riuscito a fare il count");
      },
    });
  }

  public onLazyLoad(event: LazyLoadEvent): void {
    if (event.first === 0 && event.rows === this.rowsNumber) {
      event.rows = event.rows * 2;
    }

    console.log(`Chiedo ${this.pageConf.conf.limit} righe con offset di ${this.pageConf.conf.offset}`);
    this.storedLazyLoadEvent = event;

    this.loadData();
  }

  public resetPaginationAndLoadData(): void {
    if (!!!this.storedLazyLoadEvent) {
      this.storedLazyLoadEvent = {};
    }
    this.storedLazyLoadEvent.first = 0;
    this.storedLazyLoadEvent.rows = this.rowsNumber * 2;
    this.loadData();
  }

  public onEnterInputName(val: any): void {}
}
