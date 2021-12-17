import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from "@angular/core";
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Impostazioni } from "./impostazioni";
import { NtJwtLoginService, UtenteUtilities } from "@bds/nt-jwt-login";
import { ImpostazioniService } from "src/app/services/impostazioni.service";
import { Subscription } from "rxjs";
import { FormControl, Validators } from '@angular/forms';
import { Inplace } from 'primeng/inplace';


@Component({
  selector: "app-impostazioni",
  templateUrl: "./impostazioni.component.html",
  styleUrls: ["./impostazioni.component.scss"]
})
export class ImpostazioniComponent implements OnInit, OnDestroy, AfterViewInit {

  checked: boolean;
  model: Impostazioni;
  loggedUser: UtenteUtilities;
  thereIsEmail: boolean;
  private subscription: Subscription;
  @ViewChild('inplace')
  public inplace: Inplace;

  emailRegex = new RegExp(/^(([^&#!?'òùàèéì%+*§$£<>()\[\]\.,;:\s@\"]+(\.[^<>&#!?'òùàèéì%+*§$£()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()&#!?'%òùàèéì+*§$£[\]\.,;:'\s@\"]+\.)+[^<>&#!?%'òùàèéì+*§$£()[\]\.,;:'\s@\"]{2,})$/);

  public mail = new FormControl('', Validators.pattern(this.emailRegex));

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
    this.model.emailToNotify = this.impostazioniService.getEmailToNotify();
    this.thereIsEmail = this.model.emailToNotify != '' ? true : false;
    if (this.model.hidePreview === null || this.model.hidePreview === undefined) {
      this.model.hidePreview = false;
    }
  }

  saveSettings() {
    this.impostazioniService.setHidePreview(this.model.hidePreview.toString());
    if(this.model.emailToNotify){
      this.impostazioniService.setEmailToNotify(this.model.emailToNotify.toString());
    }
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

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  deleteEmailToNotify() {
    this.model.emailToNotify = '';
  }

  disabledIf() {
    if (this.inplace && this.inplace.active) {
      if (this.mail.status == 'VALID' && this.mail.value != '') {
        return false;
      }
      return true;
    }
    return false;
  }
}
