import { Utente } from "@bds/ng-internauta-model";
import { Component, OnInit } from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import { SCRIVANIA_ROUTE, BABELMAN_URL} from "../../environments/app-constants";
import { NtJwtLoginService, LoginType, UtenteUtilities } from "@bds/nt-jwt-login";
import { MenuItem, DialogService } from "primeng/api";
import { HttpClient } from "@angular/common/http";
import { ImpostazioniComponent } from "./impostazioni/impostazioni.component";


@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
  providers: [DialogService]
})
export class HeaderComponent implements OnInit {

  public utenteConnesso: UtenteUtilities;
  cambioUtentePopupVisibile: boolean = false;
  private logoutUrlTemplate: string;
  public itemsMenu: MenuItem[];

  constructor(public router: Router, private loginService: NtJwtLoginService, public dialogService: DialogService) { }


  onCambioUtenteClick() {
    console.log("header onCambioUtenteClick()");

    this.cambioUtentePopupVisibile = true;
  }

  ngOnInit() {
    console.log("header ngOnInit()");
    this.loginService.loggedUser$.subscribe((utente: UtenteUtilities) => {
      if (utente) {
        this.utenteConnesso = utente;
        const jsonParametri = JSON.parse(utente.getUtente().idAzienda.parametri);
        this.logoutUrlTemplate = jsonParametri.logoutUrl as string;
        this.buildMenu();
      }
    });
  }

  onLogout() {

    if (!this.loginService.isUserImpersonated) {
      if (this.loginService.loginMethod !== LoginType.SSO) {
        console.log(this.loginService.loginMethod);
        this.loginService.clearSession();
        window.location.reload();
      } else {
        // prende l'url di logout dall'azienda dell'utente loggato
        this.loginService.clearSession();
        const lastSlash: number = window.location.href.lastIndexOf("/");
        const returnUrl: string = window.location.href.substring(0, lastSlash) + SCRIVANIA_ROUTE;
        window.location.href = this.logoutUrlTemplate.replace("[return-url]", returnUrl);
      }
    } else {
      this.loginService.clearSession();
      window.close();
    }
  }

  onCambioUtente(utente: Utente) {
    console.log("header onCambioUtente");
    this.cambioUtentePopupVisibile = false;

    if (utente) {
      let url: string = "''";

      let user: string;
      let realUser: string;
      if (this.loginService.loginMethod === LoginType.SSO) {
        user = utente.idPersona.codiceFiscale;
        realUser = this.utenteConnesso.getUtente().idPersona.codiceFiscale;
      } else {
        user = utente.username;
        realUser = this.utenteConnesso.getUtente().username;
      }

      if (window.location.href.indexOf("?") >= 0) {
        url = window.location.href.toString() + "&impersonatedUser=" + user + "&realUser=" + realUser;
      } else {
        url = window.location.href.toString() + "?impersonatedUser=" + user + "&realUser=" + realUser;
      }
      window.open(url, "_blank");
    }
  }

  buildMenu() {

    const aziende = [];
    this.utenteConnesso.getUtente().aziende.forEach(azienda => {
      aziende.push({ label: azienda.nome, command: (onclick) => {this.doNothingNodeClick(onclick); }});
    });

    const ruoli = [];
    this.utenteConnesso.getUtente().ruoli.forEach(ruolo => {
      ruoli.push({ label: ruolo.nomeBreve, command: (onclick) => {this.doNothingNodeClick(onclick); } });
    });
    aziende.push({
      label: "Ruoli",
      icon: "pi pi-fw pi-key slide-icon",
      items: ruoli
    });
    this.itemsMenu = [];
    this.itemsMenu.push({
      label: "Aziende",
      icon: "pi pi-fw pi-globe slide-icon",
      items: aziende
    });
    this.itemsMenu.push({
      label: "Manuale",
      icon: "pi pi-fw pi-question slide-icon",
      command: () => { window.open(BABELMAN_URL); }
    });
    this.itemsMenu.push({
      label: "Impostazioni",
      icon: "pi pi-fw pi-cog slide-icon",
      command: () => { this.showSettings(); }
    });
    if (this.utenteConnesso.getUtente().isDemiurgo()) {
      this.itemsMenu.push({
        label: "Cambia utente",
        icon: "pi pi-fw pi-sign-in",
        command: () => { this.onCambioUtenteClick(); }
      });
    }
  }

  showSettings() {
    const ref = this.dialogService.open(ImpostazioniComponent, {
      header: "Impostazioni utente",
      width: "480px",
      styleClass: "dialog-class",
      contentStyle: {"max-height": "350px", "overflow": "auto", "height": "200px"}
    });
    /* ref.onClose.subscribe((form: Impostazioni) => {
      if (form) {
        console.log("FORM = ", form);
      }
    }); */
  }

  doNothingNodeClick(event: any) {
    if (event && event.originalEvent) {
      event.preventDefault();
    }
  }
}
