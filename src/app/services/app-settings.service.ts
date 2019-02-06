import { Injectable } from "@angular/core";
import { UtenteUtilities, NtJwtLoginService } from "@bds/nt-jwt-login";
import { ApplicationCustiomization } from "src/environments/application_customization";
import { Subscription, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AppSettingsService {
  impostazioniVisualizzazione: any;
  loggedUser: UtenteUtilities;
  subscription: Subscription;
  settingsChanged = new Subject<boolean>();

  constructor(private loginService: NtJwtLoginService) {
    this.subscription = this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      if (utente) {
        if (!this.loggedUser || utente.getUtente().id !== this.loggedUser.getUtente().id) {
          this.loggedUser = utente;
          if (this.loggedUser.getImpostazioniApplicazione()) {
            this.impostazioniVisualizzazione = JSON.parse(this.loggedUser.getImpostazioniApplicazione().impostazioniVisualizzazione);
          }
        } else {
          this.loggedUser = utente;
        }
      }
    });
  }

  getImpostazioniVisualizzazione() {
    return this.impostazioniVisualizzazione;
  }

  getRightSideOffsetWidth() {
    return this.impostazioniVisualizzazione[ApplicationCustiomization.scrivania.rigthside.offsetWidth];
  }

  setRightSideOffsetWidth(width: number) {
    this.impostazioniVisualizzazione[ApplicationCustiomization.scrivania.rigthside.offsetWidth] = width;
  }

  getHidePreview() {
    return this.impostazioniVisualizzazione[ApplicationCustiomization.scrivania.hidePreview];
  }

  setHidePreview(hidePreviewValue: string) {
    this.impostazioniVisualizzazione[ApplicationCustiomization.scrivania.hidePreview] = hidePreviewValue;
  }

  saveSettings() {
    this.settingsChanged.next(true);
  }

}
