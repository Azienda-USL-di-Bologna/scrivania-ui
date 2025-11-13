import { Component, effect, inject, input, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { DettaglioAttivita, DettaglioAttivitaService } from "@bds/internauta-model";
import { FILTER_TYPES, FilterDefinition, FiltersAndSorts, PAGE_CONF_NO_LIMIT } from "@bds/next-sdr";
import { Subject, Subscription, takeUntil } from "rxjs";
@Component({
  selector: "detail-riepilogo",
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <div class="p-4">
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
        class="w-full"
      >
        <!-- <ng-template pTemplate="header">
          <tr>
            <th class="w-3/4">Descrizione</th>
            <th class="w-1/4"></th>
          </tr>
        </ng-template> -->

        <ng-template pTemplate="groupheader" let-groupValue>
          <tr>
            <td colspan="2" class="bg-surface-100 font-medium">
              {{ formatSottosezione(groupValue.sottosezione) }}
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.descrizione }}</td>
            <td>
              @if (row.url) {
                <a
                  [href]="row.url!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline cursor-pointer"
                  >Apri</a
                >
              } @else {
                <span class="text-muted-color">—</span>
              }
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class DetailRiepilogoComponent {
  private dettaglioAttivitaService = inject(DettaglioAttivitaService);
  readonly idAttivita = input<number>();
  rows = signal<DettaglioAttivita[]>([]);
  private cancelLoad$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  constructor() {
    effect(() => {
      const idAttivita = this.idAttivita();
      this.loadData();
    });
  }
  
  private loadData() {
    this.cancelLoad$.next(); // Annulla eventuali chiamate precedenti

    const filters = new FiltersAndSorts();
    filters.addFilter(new FilterDefinition("idAttivita", FILTER_TYPES.not_string.equals, this.idAttivita()));

    const subscription = this.dettaglioAttivitaService
      .getData(null, filters, null, PAGE_CONF_NO_LIMIT)
      .pipe(takeUntil(this.cancelLoad$), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res) {
            this.rows.update(val => val = [...res]);
          }

          //console.log("spengo il loading");
          //this.loading.set(false);
        },
        error: (err) => {
          // Gestione errore migliorata - non resettare loading se è stato cancellato
          if (err.name !== "AbortError") {
            // Non è un errore di cancellazione
            console.error("Errore nel caricamento del riepilogo", err);
            //this.loading.set(false);
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
