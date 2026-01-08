import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { Applicazioni, PermessoDocService, UrlsGenerationStrategy } from "@bds/internauta-model";
import { FILTER_TYPES, FilterDefinition, FiltersAndSorts } from "@bds/next-sdr";
import { AttivitaService } from "../attivita/attivita.service";

type CompiledUrlEntry = { url?: string; label?: string };

@Injectable({ providedIn: "root" })
export class AttivitaAzioneService {
  constructor(
    private loginService: JwtLoginService,
    private attivitaService: AttivitaService,
    private messageService: MessageService,
    private permessoDocService: PermessoDocService
  ) {}

  public canShowAction(item: any): boolean {
    const tipo = item?.tipo;
    const appId = item?.idApplicazione?.id;
    return (
      tipo === "attivita" ||
      (tipo === "notifica" && ["procton", "dete", "deli", "downloader"].includes(appId))
    );
  }

  public parseCompiledUrls(item: any): CompiledUrlEntry[] {
    const raw = item?.compiledUrls;
    if (!raw || typeof raw !== "string") return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as CompiledUrlEntry[]) : [];
    } catch {
      return [];
    }
  }

  public getActionLabel(item: any, defaultRispondiLabel: string = "Rispondi"): string {
    const urls = this.parseCompiledUrls(item);
    const label = urls?.[0]?.label ?? "Apri";
    return label === "Accetta/rifiuta" ? defaultRispondiLabel : label;
  }

  public hasActionUrl(item: any): boolean {
    const urls = this.parseCompiledUrls(item);
    return !!urls?.[0]?.url;
  }

  public openAction(item: any, loggedUser: UtenteUtilities): void {
    if (!this.canShowAction(item)) return;

    const urls = this.parseCompiledUrls(item);
    const firstUrl = urls?.[0]?.url;
    if (!firstUrl) return;

    const appId = item?.idApplicazione?.id;
    if (appId === "downloader") {
      this.downloadArchivioZip(item, firstUrl);
      return;
    }

    this.openInterApp(item, loggedUser, firstUrl);
  }

  /**
   * Usare questo metodo SOLO per le righe di "Attività fatte".
   * Se l'azione apre un documento (datiAggiuntivi.id_doc), controlla prima il permesso (PermessoDoc).
   */
  public openActionFromAttivitaFatte(item: any, loggedUser: UtenteUtilities): void {
    const idDoc = item?.datiAggiuntivi?.id_doc;
    if (idDoc == null) {
      this.openAction(item, loggedUser);
      return;
    }

    const idPersona = loggedUser?.getUtente?.()?.fk_idPersona?.id;
    if (!idPersona) {
      this.showNoDocAccessToast();
      return;
    }

    const filters = new FiltersAndSorts();
    filters.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, idPersona));
    filters.addFilter(new FilterDefinition("idDocDetail.id", FILTER_TYPES.not_string.equals, idDoc));

    this.permessoDocService.getData(null, filters, null, null).subscribe({
      next: (data: any) => {
        const hasPermission = !!data?.results?.length;
        if (hasPermission) {
          this.openAction(item, loggedUser);
        } else {
          this.showNoDocAccessToast();
        }
      },
      error: () => this.showNoDocAccessToast(),
    });
  }

  private openInterApp(item: any, loggedUser: UtenteUtilities, fallbackUrl: string): void {
    const aziendeAttive = loggedUser?.getUtente?.()?.aziendeAttive ?? [];
    const usaFlussiInternauta =
      aziendeAttive.filter((a: any) => {
        try {
          return (
            a.id === item?.idAzienda?.id &&
            a.parametriAzienda?.hasOwnProperty("abilitaFlussiInternauta") &&
            JSON.parse(a.parametriAzienda.abilitaFlussiInternauta)
          );
        } catch {
          return false;
        }
      }).length === 1;

    const encodeParams =
      item?.idApplicazione?.urlGenerationStrategy === UrlsGenerationStrategy.TRUSTED_URL_WITH_CONTEXT_INFORMATION ||
      item?.idApplicazione?.urlGenerationStrategy === UrlsGenerationStrategy.TRUSTED_URL_WITHOUT_CONTEXT_INFORMATION;

    const addRichiestaParam = true;
    const addPassToken = true;

    let url = fallbackUrl;
    let tabName: string | undefined;
    if (usaFlussiInternauta) {
      tabName = "Gedi Internauta";
      const idDoc = item?.datiAggiuntivi?.id_doc;
      url = idDoc ? `${this.getFrontedAppUrl("scripta")}/nav/docs/${idDoc}` : fallbackUrl;
    }

    this.loginService
      .buildInterAppUrl(url, encodeParams, addRichiestaParam, addPassToken, true, true, tabName, appIdToEnum(item))
      .subscribe();
  }

  private downloadArchivioZip(item: any, url: string) {
    this.attivitaService.verifyArchivioZip(url).subscribe({
      next: () => {
        const link = document.createElement("a");
        link.href = url;
        link.click();
        this.messageService.add({
          severity: "success",
          key: "attivitaToast",
          summary: "Download completato",
          detail: `Scaricamento archivio compresso ${item?.oggetto ?? ""} avviato con successo.`,
        });
      },
      error: (err) => {
        if (err?.status === 401) {
          this.messageService.add({
            severity: "error",
            key: "attivitaToast",
            summary: "Attenzione",
            detail: `Il link per il download non è più valido. Si prega di ripetere l'operazione.`,
          });
        } else {
          this.messageService.add({
            severity: "error",
            key: "attivitaToast",
            summary: "ERRORE",
            detail: `C'è stato un errore imprevisto sul server.`,
          });
        }
      },
    });
  }

  /**
   * Crea l'url di una app frontend
   */
  private getFrontedAppUrl(app: string): string {
    const wl = window.location;
    let port = wl.port;
    app = "/" + app;
    if (wl.hostname === "localhost") {
      port = "4200";
      app = "";
    }
    return wl.protocol + "//" + wl.hostname + (port ? ":" + port : "") + app;
  }

  private showNoDocAccessToast() {
    this.messageService.add({
      severity: "info",
      key: "attivitaToast",
      summary: "Attenzione",
      detail: "Non hai accesso a questo documento",
    });
  }
}

function appIdToEnum(item: any): Applicazioni {
  return (item?.idApplicazione?.id as Applicazioni) ?? (undefined as any);
}


