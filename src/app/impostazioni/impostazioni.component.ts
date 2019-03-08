import { Component, OnInit, OnDestroy } from "@angular/core";
import { DynamicDialogRef } from "primeng/api";
import { Impostazioni } from "./impostazioni";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { ImpostazioniService } from "src/app/services/impostazioni.service";
import { Subscription } from "rxjs";


@Component({
  selector: "app-impostazioni",
  templateUrl: "./impostazioni.component.html",
  styleUrls: ["./impostazioni.component.css"]
})
export class ImpostazioniComponent implements OnInit, OnDestroy {

  checked: boolean;
  model: Impostazioni;
  loggedUser: UtenteUtilities;
  private subscription: Subscription;

  constructor(public ref: DynamicDialogRef, private loginService: NtJwtLoginService, private impostazioniService: ImpostazioniService) { }

  ngOnInit() {
    this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      if (utente) {
        if (!this.loggedUser || utente.getUtente().id !== this.loggedUser.getUtente().id) {
          this.loggedUser = utente;
          this.loadSettings();
        }
      }
    });
  }

  loadSettings() {
    this.model = new Impostazioni();
    this.model.hidePreview = this.impostazioniService.getHidePreview() === "true";
    if (this.model.hidePreview === null || this.model.hidePreview === undefined) {
      this.model.hidePreview = false;
    }
  }

  saveSettings() {
    this.impostazioniService.setHidePreview(this.model.hidePreview.toString());
    this.subscription =
      this.loggedUser.setImpostazioniApplicazione(this.loginService, this.impostazioniService.getImpostazioniVisualizzazione())
      .subscribe((newSettings) => {
        this.impostazioniService.doNotify(newSettings);
        this.onClose();
      });
    }

  onClose() {
    this.ref.close();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
