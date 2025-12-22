import { Component, effect, inject, input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { DettaglioAttivita, DettaglioAttivitaService } from "@bds/internauta-model";
import { FILTER_TYPES, FilterDefinition, FiltersAndSorts, PAGE_CONF_NO_LIMIT } from "@bds/next-sdr";
import { Subject, Subscription, takeUntil } from "rxjs";
import { JwtLoginService } from "@bds/jwt-login";

@Component({
  selector: "detail-riepilogo",
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <h2 class="text-2xl font-semibold mb-4">Riepilogo</h2>

    <p-table
      [value]="rows()"
      rowGroupMode="subheader"
      groupRowsBy="sottosezione"
      [sortMode]="'single'"
      [sortField]="'sottosezione'"
      [sortOrder]="1"
      [paginator]="false"
      [lazy]="false"
      [scrollable]="true"
      [loading]="loading()"
    >
      <!-- <ng-template pTemplate="header">
        <tr>
          <th class="w-3/4">Descrizione</th>
          <th class="w-1/4"></th>
        </tr>
      </ng-template> -->

      <ng-template
        pTemplate="groupheader"
        let-groupValue
      >
        <tr pRowGroupHeader>
          <td
            [attr.colspan]="showOpenColumn() ? 2 : 1"
            class="bg-surface-100 font-medium"
          >
            {{ formatSottosezione(groupValue.sottosezione) }}
          </td>
        </tr>
      </ng-template>

      <ng-template
        pTemplate="body"
        let-row
      >
        <tr>
          <td class="w-full descrizione-cell">{{ row.descrizione }}</td>
          @if (showOpenColumn()) {
            <td class="w-3">
              @if (row.url) {
                <a
                  (click)="apri(row.url)"
                  class="text-primary hover:underline cursor-pointer"
                  >Apri</a
                >
              } @else {
                <span class="text-muted-color">—</span>
              }
              </td>
          }
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      p-table {
        flex: 1 1 0;
        min-height: 0;
      }
    }
    .descrizione-cell {
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
  `,
})
export class DetailRiepilogoComponent {
  // services
  private dettaglioAttivitaService = inject(DettaglioAttivitaService);
  private loginService = inject(JwtLoginService);

  // input
  readonly idAttivita = input<number>();

  private cancelLoad$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  public rows = signal<DettaglioAttivita[]>([]);
  public loading = signal<boolean>(false);
  public showOpenColumn = signal<boolean>(false);

  constructor() {
    effect(() => {
      const idAttivita = this.idAttivita();
      this.rows.set([]);
      if (idAttivita) {
        this.loadData();
      }
    });
  }

  private loadData() {
    this.cancelLoad$.next(); // Annulla eventuali chiamate precedenti
    this.loading.set(true);

    const filters = new FiltersAndSorts();
    filters.addFilter(new FilterDefinition("idAttivita", FILTER_TYPES.not_string.equals, this.idAttivita()));

    const subscription = this.dettaglioAttivitaService
      .getData(null, filters, null, PAGE_CONF_NO_LIMIT)
      .pipe(takeUntil(this.cancelLoad$), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res) {
            this.rows.update((val) => (val = [...res.results]));
            this.showOpenColumn.set(this.rows().some((row) => row.url));
          }

          console.log("spengo il loading");
          this.loading.set(false);
        },
        error: (err) => {
          // Gestione errore migliorata - non resettare loading se è stato cancellato
          if (err.name !== "AbortError") {
            // Non è un errore di cancellazione
            console.error("Errore nel caricamento del riepilogo", err);
            this.loading.set(false);
          }
        },
      });
    this.subscriptions.push(subscription);
  }

  // Trasformazione: prima lettera maiuscola, resto minuscolo, rimozione underscore
  formatSottosezione(value: string | null | undefined): string {
    if (!value) return "";
    const noUnderscore = value.replaceAll("_", "");
    return noUnderscore.charAt(0).toUpperCase() + noUnderscore.slice(1).toLowerCase();
  }

  public apri(url: string) {  
    if (url) {
      const isScripta = url.includes("scripta");
      this.loginService
        .buildInterAppUrl(
          url,
          false, // encodeParams
          false, // addRichiestaParam
          true, // addPassToken
          true, // openWindow
          true, // saveAndRestoreLoggedUser
          isScripta ? "Gedi Internauta" : null // windowName
        )
        .subscribe((url: string) => {
          console.log("urlAperto:", url);
        });
    }
  }

  ngOnDestroy(): void {
    console.log("DEBUG: ngOnDestroy chiamato, unsubscribendo", this.subscriptions.length, "subscriptions");
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
    this.cancelLoad$.next(); // FIX: Cancella eventuali chiamate in corso
    this.cancelLoad$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
