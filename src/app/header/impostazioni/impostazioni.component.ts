import { Component, OnInit } from "@angular/core";
import { DynamicDialogRef } from "primeng/api";
import { Impostazioni } from "./impostazioni";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { AppSettingsService } from "src/app/services/app-settings.service";


@Component({
  selector: "app-impostazioni",
  templateUrl: "./impostazioni.component.html",
  styleUrls: ["./impostazioni.component.css"]
})
export class ImpostazioniComponent implements OnInit {

  checked: boolean;
  model: Impostazioni;
  loggedUser: UtenteUtilities;
  previewDisabled: boolean;

  constructor(public ref: DynamicDialogRef, private loginService: NtJwtLoginService, private appSettingService: AppSettingsService) { }

  ngOnInit() {
    this.previewDisabled = window.screen.width <= 1280 ? true : false;
    this.model = new Impostazioni();
    this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      if (utente) {
        if (!this.loggedUser || utente.getUtente().id !== this.loggedUser.getUtente().id) {
          this.loggedUser = utente;
          this.model.hidePreview = this.appSettingService.getHidePreview() === "true";
          if (this.model.hidePreview === null || this.model.hidePreview === undefined) {
            this.model.hidePreview = false;
          }
        }
      }
    });
  }

  onSave() {
    this.appSettingService.setHidePreview(this.model.hidePreview.toString());
    this.loggedUser.setImpostazioniApplicazione(this.loginService, this.appSettingService.getImpostazioniVisualizzazione());
    this.appSettingService.saveSettings();
    this.ref.close(this.model);
  }

  onClose() {
    this.ref.close();
  }

}
