import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { Applicazioni, PermessoDocService, UrlsGenerationStrategy } from "@bds/internauta-model";
import { FILTER_TYPES, FilterDefinition, FiltersAndSorts } from "@bds/next-sdr";
import { AttivitaService } from "./attivita.service";
import { DocumentOpenerService } from "src/app/shared/services/document-opener.service";

@Injectable({ providedIn: "root" })
export class AttivitaAzioneService {
  constructor(private documentOpenerService: DocumentOpenerService) {}

  public canShowAction(item: any): boolean {
    return this.documentOpenerService.canShowAction(item);
  }

  public parseCompiledUrls(item: any): any[] {
    return this.documentOpenerService.parseCompiledUrls(item);
  }

  public getActionLabel(item: any, defaultRispondiLabel: string = "Rispondi"): string {
    return this.documentOpenerService.getActionLabel(item, defaultRispondiLabel);
  }

  public hasActionUrl(item: any): boolean {
    return this.documentOpenerService.hasActionUrl(item);
  }

  public openAction(item: any, loggedUser: UtenteUtilities): void {
    this.documentOpenerService.openAction(item, loggedUser);
  }

  public openActionFromAttivitaFatte(item: any, loggedUser: UtenteUtilities): void {
    this.documentOpenerService.openActionFromAttivitaFatte(item, loggedUser);
  }

  public openInterApp(item: any, loggedUser: UtenteUtilities, fallbackUrl: string): void {
    this.documentOpenerService.openInterApp(item, loggedUser, fallbackUrl);
  }
}
